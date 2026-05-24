
from study.models import (
    StudyGroup,
    Subject,
    MemberShip,
    Session,
    Attendance, Resource, ResourceDownload, ResourceViews
)
from User.models import User
from django.shortcuts import get_object_or_404
from django.utils.timezone import now
from rest_framework.exceptions import ValidationError, NotFound, PermissionDenied
from django.db import transaction
from django.db import IntegrityError
# for attendance history
from django.db.models.functions import TruncDate, JSONObject
from django.contrib.postgres.aggregates import ArrayAgg
from django.utils.timezone import now
from django.utils import timezone
from django.db.models import F

from core.services import CoreService

class BaseService:
    @staticmethod
    def get_membership(group=None, user=None, group_id=None, user_id=None):
        return MemberShip.objects.filter(
            group=group,
            user=user
        ).first()

    @staticmethod
    def require_active_membership(group, user):
        membership = BaseService.get_membership(
            group=group,
            user=user,
        )
        if membership is None:
            raise ValidationError({
                "detail": f"No Membership in {group.name}",
                "code": "NO_MEMBERSHIP"
            })

        if membership.status != MemberShip.MemberShipStatus.ACCEPTED:
            raise ValidationError({
                "detail": f"{user.username} are not an active member of {group.name}",
                "code": "NOT_ACTIVE_MEMBER"
            })

        return membership



    @staticmethod
    def _get_group_and_user(group_id: int, user_id: int):
        group = get_object_or_404(StudyGroup, id=group_id)
        user = get_object_or_404(User, id=user_id)
        return group, user


class StudyGroupService(BaseService):
    @staticmethod
    @transaction.atomic
    def _handle_join(group, user, membership):
        if membership:
            if membership.status == MemberShip.MemberShipStatus.ACCEPTED:
                raise ValidationError({
                    "detail": "You are already a member",
                    "code": "ALREADY_MEMBER"
                })

            if membership.status == MemberShip.MemberShipStatus.PENDING:
                raise ValidationError({
                    "detail": "Join request already pending",
                    "code": "ALREADY_PENDING"
                })

        membership = MemberShip.objects.create(
            group=group,
            user=user,
            status=MemberShip.MemberShipStatus.PENDING
        )

        return {
            "detail": "Join request sent",
            "status": membership.status
        }
    
    @staticmethod
    @transaction.atomic
    def _handle_cancel(group, user, membership):
        if not membership:
            raise ValidationError({
                "detail": "No membership request found",
                "code": "NO_MEMBERSHIP"
            })

        if membership.status != MemberShip.MemberShipStatus.PENDING:
            raise ValidationError({
                "detail": "Only pending requests can be cancelled",
                "code": "INVALID_CANCEL"
            })

        membership.delete()

        return {
            "detail": "Join request cancelled",
            "status": "none"
        }

    @staticmethod
    def invite(group_id: int, invited_user_id: int):
        group, invited_user = StudyGroupService._get_group_and_user(group_id, invited_user_id)
        membership_record = StudyGroupService.get_membership(group, invited_user)

        if membership_record:
            if membership_record.status == MemberShip.MemberShipStatus.ACCEPTED:
                raise ValidationError({
                    "detail": f"{invited_user.username} is already a member",
                    "code": "ALREADY_MEMBER"
                })

            if membership_record.status == MemberShip.MemberShipStatus.PENDING:
                raise ValidationError({
                    "detail": f"{invited_user.username} already has a pending invite/request",
                    "code": "ALREADY_PENDING"
                })


        # i am keeping a strict one group, one membership per one user
        try:
            MemberShip.objects.create(
                group=group,
                user=invited_user,
                status=MemberShip.MemberShipStatus.PENDING
            )
        except IntegrityError:
            raise ValidationError({
                "detail": f"{invited_user.username} has already an existing membership request",
                "code": "ALREADY_MEMBERSHIP_REQUEST"
            })

        return {
            "message": f"{invited_user.username} invited to {group.name}",
            "status": "pending"
        }

    @staticmethod
    def membership_request(request_type: str, group_id: int, user_id: int):
        request_type = request_type.lower()

        if request_type.lower() not in ["join", "cancel"]:
            raise ValidationError({
                "detail": f"{request_type} is not a valid request_type",
                "code": "INVALID_REQUEST_TYPE"
            })

        group, user = StudyGroupService._get_group_and_user(group_id, user_id)
        # check if the user has already an exisinng membership record
        membership_record = StudyGroupService.get_membership(group, user)

        if membership_record:
            if membership_record.status == MemberShip.MemberShipStatus.PENDING:
                raise ValidationError({
                    "detail": f"{user.username} already has a pending invite/request",
                    "code": "ALREADY_PENDING"
                })

        actions = {
            "join": StudyGroupService._handle_join,
            "cancel": StudyGroupService._handle_cancel,
        }

        return actions[request_type](group, user, membership_record)


    # simply return things or prepares or shape data, no saving action
    @staticmethod
    def attendance_history(group_id:int, user_id:int) -> dict:
        group, user = StudyGroupService._get_group_and_user(group_id, user_id)
        # check if the user is an accepted member
        membership_record = StudyGroupService.require_active_membership(group, user)

        attendances = Attendance.objects.filter(group=group)
        result = (
            attendances
            .annotate(date=TruncDate("created_at"))
            .values("date")
            .annotate(
                users=ArrayAgg(
                    JSONObject(
                        id="user__id",
                        username="user__username",
                        avatar="user__avatar",
                    ),
                    distinct=True
                )
            )
            .order_by("date")
        )
        return result


    @staticmethod
    def sessions_list(group_id:int, user_id:int, status:str) -> dict:
        group, user = StudyGroupService._get_group_and_user(group_id, user_id)
        # check if the user is an accepted member
        membership_record = StudyGroupService.require_active_membership(group, user)

        result = group.sessions.filter(status=status) if status else group.sessions.all()
        
        return result.order_by("-created_at")



class MembershipService(BaseService):

    @staticmethod
    def _check_group_capacity(group):
        # get the number of members of the group
        members_count = group.memberships.filter(status=MemberShip.MemberShipStatus.ACCEPTED).count()
    
        # get the capacity
        maximum_capacity = group.max_members
        
        if members_count >= maximum_capacity:
            return "full"
        elif members_count == 0:
            return "empty"
        else:
            return "available"

    @staticmethod
    def _update_membership_status(group, user, new_status: str) -> dict:
        """Fetches membership and updates its status."""

        valid_statuses = [status.value for status in MemberShip.MemberShipStatus]
        
        if new_status not in valid_statuses:
            raise ValidationError({
                "detail": f"Invalid status '{new_status}'. Valid statuses are: {valid_statuses}",
                "code": "INVALID_STATUS"
            })
    
        membership = MembershipService.get_membership(group=group, user=user)
        membership.status = new_status
        membership.save()
        return {"message": {"updated": True}}

    @staticmethod
    def _update_membership_role(group, member, new_role:str) -> dict:
        """Fetches membership and updates its roles."""
        membership = MembershipService.get_membership(group=group, user=member)
        membership.role = new_role
        membership.save()
        return {"message": {"updated": True}}

    @staticmethod
    def _check_user_role(group, acting_user_id:int):
        """raises permission denied if not creator or moderator"""
        acting_user = get_object_or_404(MemberShip, user_id=acting_user_id, group=group)
        if acting_user.role == MemberShip.Role.MEMBER:
            raise PermissionDenied({
                "detail":"You do NOT have permission for this action",
                "code":"PERMISSION_DENIED"
            })


    @staticmethod
    def handle_status_update(member_id: int, acting_user_id: int, group_id: int, new_status: str, ) -> dict:
        group, member = MembershipService._get_group_and_user(group_id, member_id)
        # check if authorized, raises exception if not authorized
        MembershipService._check_user_role(group=group, acting_user_id=acting_user_id)

        normalized_status = new_status.lower()

        if (
            normalized_status == MemberShip.MemberShipStatus.ACCEPTED
            and (MembershipService._check_group_capacity(group) == "full")
        ):
            raise ValidationError({
                "detail": "Study group is already at full capacity.",
                "code": "REQUEST_DENIED",
            })

        return MembershipService._update_membership_status(group, member, normalized_status)

    @staticmethod
    def handle_role_update(member_id:int, acting_user_id: int, group_id:int, new_role:str) -> dict:
        group, member = MembershipService._get_group_and_user(group_id, member_id)
        # check if authorized, raises exception if not authorized
        MembershipService._check_user_role(group=group, acting_user_id=acting_user_id)
        normalized_role = new_role.lower()

        membership_record = MembershipService.get_membership(group, member)
    
        if normalized_role == membership_record.role:
            raise ValidationError({
                "detail":f"{member.username} is already a {normalized_role}",
                "code":"REQUEST_INVALID"
            })        
        return MembershipService._update_membership_role(group, member, normalized_role)



class SessionService(BaseService):
    @staticmethod
    def _check_if_session_finished(session):
        print("CHECKING SEESSION___________________________________________________________________________________________")
        time_now = timezone.now()
        if time_now >= session.end:
            session.status = Session.SessionStatus.FINISHED
            session.save()
            print("MARRRKED___________________________________________________________")


    @staticmethod
    def join(session_id, user): #to be used in the socket
        # when user joins sessions,  an attendance record is automatically created
        session = get_object_or_404(Session, id=session_id)

        # checks first if the user  joining the session is a member
        is_member = MemberShip.objects.filter(
            user=user,
            group=session.group,
            status=MemberShip.MemberShipStatus.ACCEPTED
        ).exists()

        if not is_member:
            raise PermissionDenied({
                "detail": "You are not a valid member of this group",
                "code": "NOT_MEMBER"
            })


        # check time right now, if time is equal to or greater than session end time, mark as finished
        SessionService._check_if_session_finished(session=session)

        if session.end < now():
            # return {"error": "Session already ended"}
            raise ValidationError({
                "detail": "Session already ended",
                "code": "SESSION_EXPIRED"
            })


        SessionService._create_attendance(session=session, user=user)

        return {"message":{"joined":True}}
    
    @staticmethod
    @transaction.atomic
    def leave(session_id, user):
        session = get_object_or_404(Session, id=session_id)

        attendance = get_object_or_404(
            Attendance,
            user=user,
            session=session
        )

        # if may laman na chekcout time
        if attendance.check_out_time:
            raise ValidationError({
                "detail":"You already left",
                "code":"ACTION_INVALID"
            })
        
        if session.session_type == Session.SessionTypes.PHYSICAL:
            attendance.check_out_time = now()
            duration = (attendance.check_out_time - attendance.check_in_time).total_seconds()
            attendance.total_active_seconds = duration
        else:
            current_time = now()

            if attendance.last_active:
                diff = (current_time - attendance.last_active).total_seconds()
                if 5 < diff < 120:
                    attendance.total_active_seconds += diff

            attendance.check_out_time = current_time


        # set it to false
        attendance.is_active = False
        attendance.save()


        # check time right now, if time is equal to or greater than session end time, mark as finished
        SessionService._check_if_session_finished(session=session)

        return {"message":{"left":True}}
    


    @staticmethod
    def _validate_status_transition(instance, new_status):
        """
        Validates whether a session status change is allowed.
        """

        if (
            instance.status == "cancelled"
            and new_status in {"scheduled", "on_going"}
        ):
            if instance.start < timezone.now():
                raise ValidationError({
                    "detail": "Cannot reactivate a cancelled session that is already in the past",
                    "code": "INVALID_REACTIVATION"
                })
            

    @staticmethod
    def _validate_schedule(group_id: int, start: str, end: str, exclude_id: int = None):
            if isinstance(start, str):
                start = timezone.datetime.fromisoformat(start)
            if isinstance(end, str):
                end = timezone.datetime.fromisoformat(end)

            if timezone.is_naive(start):
                start = timezone.make_aware(start)
            if timezone.is_naive(end):
                end = timezone.make_aware(end)

            if end <= start:
                raise ValidationError({
                    "detail": "End time must be after start time",
                    "code": "INVALID_SCHEDULE"
                })

            if start < timezone.now():
                raise ValidationError({
                    "detail": "Cannot schedule a session in the past",
                    "code": "INVALID_SCHEDULE"
                })

            conflicting_query = Session.objects.filter(
                group_id=group_id,
                start__lt=end,
                end__gt=start,
                status='scheduled'
            )

            if exclude_id:
                conflicting_query = conflicting_query.exclude(id=exclude_id)

            if conflicting_query.exists():
                raise ValidationError({
                    "DETAIL": "A session is already scheduled during this time",
                    "code": "CONFLICTING_SCHEDULE"
                })

            return False

    @staticmethod
    @transaction.atomic
    def _create_session(data):
        SessionService._validate_schedule(
            group_id=data['group'].id,
            start=data['start'],
            end=data['end']
        )
        return Session.objects.create(**data)


    @staticmethod
    @transaction.atomic
    def _create_attendance(session, user):
        defaults = {"group": session.group}
        defaults["is_active"] = True
        defaults["status"] = Attendance.AttendanceStatus.PRESENT

        if session.session_type == Session.SessionTypes.PHYSICAL:
            defaults["check_in_time"] = now()
        else:
            defaults["last_active"] = now()

        Attendance.objects.get_or_create(
            user=user,
            session=session,
            defaults=defaults,
        )


    @staticmethod
    @transaction.atomic
    def update_session(instance, data):
        new_status = data.get("status", instance.status)
        
        # validates if the status transition is allowed
        SessionService._validate_status_transition(
            instance=instance,
            new_status=new_status,
        )

        # validate if no conflicting schedule exists
        SessionService._validate_schedule(
            group_id=data.get('group', instance.group).id,
            start=data.get('start', instance.start),
            end=data.get('end', instance.end),
            exclude_id=instance.pk
        )
        for attr, value in data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance





class AttendanceService(BaseService):
    @staticmethod
    @transaction.atomic
    def heartbeat(session_id, user):
        """
        ! stop heartbeat when tab hidden
        ! stop when idle (no mouse/keyboard)
        ! send heartbeat every ~30s when inside the session room
        """
        attendance = get_object_or_404(
            Attendance,
            user=user,
            session_id=session_id
        )

        if attendance.session.session_type == Session.SessionTypes.PHYSICAL:
            raise PermissionDenied({
                "detail":"Heartbeat not allowed for physical sessions",
                "code":"ACTION_INVALID"
            })
        
        # the hearbeat shouldnt work if user already left the session hahaha
        if not attendance.is_active:
            raise ValidationError({
                "detail":"You are not currently in the session",
                "code":"NOT_IN_SESSION"
            })
        
        # add active time
        if attendance.last_active:
            diff = (now() - attendance.last_active).total_seconds()

            if 5 < diff < 120:
                attendance.total_active_seconds += diff

        attendance.last_active = now()
        attendance.save()

        return {"message":"Ok"}




class ResourceService(BaseService):


    @staticmethod
    def _create_resource(data, file):
        # unlike other thing, we dont need to use get_group_and_user since in the views, we passed the validated data, so the data has now object or created/filled the object from ids
        ResourceService.require_active_membership(group=data['group'], user=data['uploader'])


        if data['resource_type'] == Resource.ResourceType.LINK:
            url = data["url"]
        elif data['resource_type'] == Resource.ResourceType.FILE:
            # upload file into the supbase and get the public url 
            url = CoreService.upload_file(file)['url']

        return Resource.objects.create(
            **data,
            url=url
        )
    
    @staticmethod
    def _update_resource(instance, actor_id, data, file):
        # unlike other thing, we dont need to use get_group_and_user since in the views, we passed the validated data, so the data has now object or created/filled the object from ids
        ResourceService.require_active_membership(group=instance.group, user=instance.uploader)
        # only uploader can update their own resources
        if instance.uploader.id != actor_id:
            raise PermissionDenied({
                "code": "INVALID_ACTION",
                "detail": "Only the uploader can update their uploaded resource."
            })


        # replacees/updates attrs with new data passed
        for attr, value in data.items():
            setattr(instance, attr, value)

        # handle url separately based on resource_type
        resource_type = data.get('resource_type', instance.resource_type)
        if resource_type == Resource.ResourceType.FILE and file:
            instance.url = CoreService.upload_file(file)['url']
        elif resource_type == Resource.ResourceType.LINK:
            instance.url = data.get('url', instance.url)

        instance.save()
        return instance
    
    # get the group and the user
    # the id is already passed anyway
    # then record it
    @staticmethod
    def _record_download(resource_id:int, group_id:int, user_id:int):

        resource_download_instance, created = ResourceDownload.objects.get_or_create(
            resource_id=resource_id,
            group_id=group_id,
            user_id=user_id,
            defaults={'count': 1}  # start at 1 on creation
        )

        # always use F for updating to avoid race condition
        # This sends a single atomic SQL statement:
        if not created:
            ResourceDownload.objects.filter(pk=resource_download_instance.pk).update(count=F('count') + 1)

        return {
            "success":True,
            "message":"Download Recorded"
        }

    @staticmethod
    def _record_views(resource_id:int, group_id:int, user_id:int):

        resource_views_instance, created = ResourceViews.objects.get_or_create(
            resource_id=resource_id,
            group_id=group_id,
            user_id=user_id,
            defaults={'count': 1}  # start at 1 on creation
        )

        # always use F for updating to avoid race condition
        # This sends a single atomic SQL statement:
        if not created:
            ResourceViews.objects.filter(pk=resource_views_instance.pk).update(count=F('count') + 1)

        return {
            "success":True,
            "message":"Views Recorded"
        }

