
from study.models import (
    StudyGroup,
    Subject,
    MemberShip,
    Session,
    Attendance
)
from User.models import User
from django.shortcuts import get_object_or_404
from django.utils.timezone import now
from rest_framework.exceptions import ValidationError, NotFound, PermissionDenied
from django.db import transaction


class StudyGroupService:
    @staticmethod
    def invite(group_id, invited_user_id):
        # creating membership pending
        group = get_object_or_404(StudyGroup, id=group_id)
        invited_user = get_object_or_404(User, id=invited_user_id)
        membership, created = MemberShip.objects.get_or_create(
            group=group,
            user=invited_user
        )
        if not created:
            raise ValidationError({
                "detail": f'Invitation invalid, {invited_user.username}"s already a member',
                "code": "INVITATION_INVALID"
            })
        return {"message":f"{invited_user.username} invited to {group.name}"}


class SessionService:
    @staticmethod
    @transaction.atomic
    def join(session_id, user):
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

        if session.end < now():
            # return {"error": "Session already ended"}
            raise ValidationError({
                "detail": "Session already ended",
                "code": "SESSION_EXPIRED"
            })


        defaults = {"group": session.group}

        if session.session_type == Session.SessionTypes.PHYSICAL:
            defaults["check_in_time"] = now()
        else:
            defaults["last_active"] = now()

        Attendance.objects.get_or_create(
            user=user,
            session=session,
            defaults=defaults
        )

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

        attendance.save()

        return {"message":{"left":True}}
    


class AttendanceService:
    @staticmethod
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
        if attendance.check_out_time:
            raise ValidationError({
                "detail":"Session already ended",
                "code":"SESSION_EXPIRED"
            })
        
        # add active time
        if attendance.last_active:
            diff = (now() - attendance.last_active).total_seconds()

            if 5 < diff < 120:
                attendance.total_active_seconds += diff

        attendance.last_active = now()
        attendance.save()

        return {"message":"Ok"}
