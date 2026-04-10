from rest_framework.viewsets import ModelViewSet
from study.models import (
    StudyGroup,
    Subject,
    MemberShip,
    Session,
    Attendance
)

from study.serializers import (
    StudyGroupSerializer,
    SubjectSerializer,
    MemberShipSerializer,
    SessionSerializer,
    AttendanceSerializer
)

from User.models import User

from django.utils.timezone import now
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from core.mixins import GroupRBACMixin, SearchMixin
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

class StudyGroupViewset(GroupRBACMixin, SearchMixin, ModelViewSet):
    queryset = StudyGroup.objects.select_related('creator','subject').all()
    serializer_class = StudyGroupSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['subject', 'creator','max_members']
    search_fields = ["name"]
    resource_name = "group"

    # invite
    @action(detail=False, methods=["post"],permission_classes=[IsAuthenticated])
    def invite(self, request):
        # endpoint for inviting user in a group
        # creating membership pending
        group_id = request.data.get("group_id")
        invited_user_id = request.data.get("invited_user_id")
        group = get_object_or_404(StudyGroup, id=group_id)
        invited_user = get_object_or_404(User, id=invited_user_id)

        membership, created = MemberShip.get_or_create(
            group=group,
            user=invited_user
        )
        
        if created:
            return Response({"message":f'Invitation invalid, {invited_user.username}"s already a member'})

        return Response({"message":f"{invited_user.user} invited to {group.name}"})



class SubjectViewset(SearchMixin, ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['name']

class MemberShipViewset(GroupRBACMixin, SearchMixin, ModelViewSet):
    queryset = MemberShip.objects.select_related('group','user').all()
    serializer_class = MemberShipSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['user']
    resource_name = "membership"

    # check if max member for the group is reached, if yes, return error, if not then proceed


class SessionViewset(GroupRBACMixin, SearchMixin, ModelViewSet):
    queryset = Session.objects.select_related('group').all()
    serializer_class = SessionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group', 'session_type']
    resource_name = "session"

    # upcoming session
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def upcoming(self, request):
        limit = int(request.query_params.get("limit", 2))

        upcoming_sessions = Session.objects.filter(
            group__membership__user=request.user,
            start__gte=now()
        ).order_by("start")[:limit]  # earliest upcoming, limit to 2

        serializer = SessionSerializer(upcoming_sessions, many=True)
        return Response(serializer.data)

    # when user joins sessions,  an attendance record is automatically created
    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def join(self, request):
        session_id = request.data.get("session_id")
        session = get_object_or_404(Session, id=session_id)

        # checks first if the user  joining the session is a member
        membership = MemberShip.objects.filter(
            user=request.user,
            group=session.group,
            status=MemberShip.MemberShipStatus.ACCEPTED
        ).exists()

        if not membership:
            return Response({"error": "You are not a valid member of this group"}, status=403)

        if session.end < now():
            return Response({"error": "Session already ended"}, status=400)

        if session.session_type == Session.SessionTypes.PHYSICAL:
            # Just mark attendance (no tracking yet)
            attendance, created = Attendance.objects.get_or_create(
                user=request.user,
                session=session,
                defaults={
                    "group": session.group,
                    "check_in_time": now()
                }
            )
        else:
            # ONLINE → track actively
            attendance, created = Attendance.objects.get_or_create(
                user=request.user,
                session=session,
                defaults={
                    "group": session.group,
                    "last_active": now()
                }
            )

        return Response({"joined": True})
    
    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def leave(self, request):
        session_id = request.data.get("session_id")

        session = get_object_or_404(Session, id=session_id)

        attendance = get_object_or_404(
            Attendance,
            user=request.user,
            session=session
        )

        # if may laman na chekcout time
        if attendance.check_out_time:
            return Response({"error": "Already left"}, status=400)
            
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

        return Response({"left": True})

class AttendanceViewset(GroupRBACMixin, ModelViewSet):
    queryset = Attendance.objects.select_related('group','user','session').all()
    serializer_class = AttendanceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group', 'user','session']
    resource_name = "attendance"
    


    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def heartbeat(self, request):
        """
        ! stop heartbeat when tab hidden
        ! stop when idle (no mouse/keyboard)
        ! send heartbeat every ~30s when inside the session room
        """
        session_id = request.data.get("session_id")
        if session_id is None:
            return Response({"error":"Please provide the session id to record heartbeat"})
            
        attendance = get_object_or_404(
            Attendance,
            user=request.user,
            session_id=session_id
        )

        if attendance.session.session_type == Session.SessionTypes.PHYSICAL:
            return Response({"error": "Heartbeat not allowed for physical sessions"}, status=400)

        # the hearbeat shouldnt work if user already left the session hahaha
        if attendance.check_out_time:
            return Response({"error": "Session already ended"}, status=400)

        # add active time
        if attendance.last_active:
            diff = (now() - attendance.last_active).total_seconds()

            if 5 < diff < 120:
                attendance.total_active_seconds += diff

        attendance.last_active = now()
        attendance.save()

        return Response({"status": "ok"})