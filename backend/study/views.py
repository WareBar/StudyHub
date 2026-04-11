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

from django.utils.timezone import now
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from core.mixins import GroupRBACMixin, SearchMixin, UserRelatedMixin
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
# services
from study.services import (
    StudyGroupService,
    SessionService,
    AttendanceService
)

# validators
from core.validators import require_params

class StudyGroupViewset(GroupRBACMixin, UserRelatedMixin,SearchMixin, ModelViewSet):
    queryset = StudyGroup.objects.select_related('creator','subject').prefetch_related('membership__user').all()
    serializer_class = StudyGroupSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['subject', 'creator','max_members']
    search_fields = ["name"]
    resource_name = "group"
    user_lookup_field = "membership__user"
    extra_filters = {
        "membership__status": MemberShip.MemberShipStatus.ACCEPTED
    }

    # invite
    @action(detail=False, methods=["post"],permission_classes=[IsAuthenticated])
    def invite(self, request):
        # endpoint for inviting user in a group
        data = require_params(request.data, "group_id", "invited_user_id")
        group_id = data["group_id"]
        invited_user_id = data["invited_user_id"]
        result = StudyGroupService.invite(group_id, invited_user_id)
        return Response(result)
    
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
        try:
            limit = int(request.query_params.get("limit", 2))
        except ValueError:
            limit = 2

        upcoming_sessions = Session.objects.filter(
            group__membership__user=request.user,
            start__gte=now()
        ).order_by("start")[:limit]  # earliest upcoming, limit to 2

        serializer = SessionSerializer(upcoming_sessions, many=True)
        return Response(serializer.data)

    # when user joins sessions,  an attendance record is automatically created
    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def join(self, request):
        data = require_params(request.data, "session_id")

        session_id = data["session_id"]
        result = SessionService.join(session_id, request.user)
        return Response(result)
    
    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def leave(self, request):
        data = require_params(request.data, "session_id")
        session_id = data["session_id"]
        result = SessionService.leave(session_id, request.user)
        return Response(result)


class AttendanceViewset(GroupRBACMixin, UserRelatedMixin, ModelViewSet):
    queryset = Attendance.objects.select_related('group','user','session').all()
    serializer_class = AttendanceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group', 'user','session']
    resource_name = "attendance"
    user_lookup_field = "user"
    
    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def heartbeat(self, request):
        data = require_params(request.data, "session_id")
        session_id = data["session_id"]
        result = AttendanceService.heartbeat(session_id, request.user)
        return Response(result)