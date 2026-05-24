from rest_framework.viewsets import ModelViewSet
from study.models import (
    StudyGroup,
    Subject,
    MemberShip,
    Session,
    Attendance, Resource
)

from study.serializers import (
    StudyGroupSerializer,
    SubjectSerializer,
    MemberShipSerializer,
    SessionSerializer,
    AttendanceSerializer, ResourceSerializer
)
from django.db.models import Count, Q
from rest_framework.exceptions import ValidationError, PermissionDenied
from django.utils.timezone import now
from rest_framework.decorators import action
from rest_framework import status
from django_filters.rest_framework import DjangoFilterBackend
from core.mixins import GroupRBACMixin, SearchMixin, UserRelatedMixin
from core.pagination import CustomPagination
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
# services
from study.services import (
    StudyGroupService,
    SessionService,
    AttendanceService, MembershipService, ResourceService
)

# validators
from core.validators import require_params



class StudyGroupViewset(GroupRBACMixin, UserRelatedMixin,SearchMixin, ModelViewSet):
    queryset = StudyGroup.objects.select_related('creator','subject').prefetch_related('memberships__user').all()
    serializer_class = StudyGroupSerializer
    pagination_class = CustomPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['subject', 'creator','max_members','memberships__role']
    search_fields = ["name", "description"] #SearchMixin
    resource_name = "group" #GroupRBACMixin
    user_lookup_field = "memberships__user" #UserRelatedMixin
    extra_filters = {
        "memberships__status": MemberShip.MemberShipStatus.ACCEPTED #GroupRBACMixin
    }

    # getting the study group attendnace history agggreagated by date
    """
    ENDPOINT -> /study-group/{id}/attendance_history/
    """
    @action(detail=True, methods=["get"],permission_classes=[IsAuthenticated])
    def attendance_history(self, request, pk=None):
        group = self.get_object()
        # check first if user is a member
        result = StudyGroupService.attendance_history(group_id=group.id, user_id=request.user.id)
        return Response(result)

    # getting sessions for this group
    @action(detail=True, methods=["get"],permission_classes=[IsAuthenticated])
    def sessions_list(self, request, pk=None):
        group = self.get_object()
        session_status = request.query_params.get("status", None)
        result = StudyGroupService.sessions_list(group_id=group.id, user_id=request.user.id, status=session_status)
        serializer = SessionSerializer(result, many=True)
        return Response(serializer.data)


    # invite
    @action(detail=False, methods=["post"],permission_classes=[IsAuthenticated])
    def invite(self, request):
        # endpoint for inviting user in a group
        data = require_params(request.data, "group_id", "invited_user_id")
        group_id = data["group_id"]
        invited_user_id = data["invited_user_id"]
        result = StudyGroupService.invite(group_id, invited_user_id)
        return Response(result)


    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def join_request(self, request, pk=None):
        result = StudyGroupService.membership_request(
            group_id=pk,
            user_id=request.user.id,
            request_type="join"
        )
        return Response(result)
    
    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def cancel_request(self, request, pk=None):
        result = StudyGroupService.membership_request(
            group_id=pk,
            user_id=request.user.id,
            request_type="cancel"
        )
        return Response(result)


class SubjectViewset(SearchMixin, ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    pagination_class = CustomPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['name']


class MemberShipViewset(GroupRBACMixin, SearchMixin, ModelViewSet):
    queryset = MemberShip.objects.select_related('group','user').all()
    serializer_class = MemberShipSerializer
    pagination_class = CustomPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['user', 'group', 'role', 'status']
    resource_name = "membership"
    search_fields = ["user__username", "user__email", "user__first_name","user__last_name"] #SearchMixin

    # for stats like total, accepted, rejected, pendning, canmclled
    @action(detail=False, methods=["get"],permission_classes=[IsAuthenticated])
    def stats(self, request):
        """
        Returns membership counts grouped by status for a given group.
        """
        group_id = request.query_params.get("group_id")
        if not group_id:
            raise ValidationError({
                "detail":"Missing group_id in the query params",
                "code":"MISSING_QUERY_PARAMS"
            })
        
        stats = self.queryset.filter(group_id=group_id).aggregate(
            total_request=Count("id"),
            accepted=Count("id", filter=Q(status="accepted")),
            pending=Count("id", filter=Q(status="pending")),
            rejected=Count("id", filter=Q(status="rejected")),
            cancelled=Count("id", filter=Q(status="cancelled")),
        )

        stats_list = [
            {"label": "Total Requests", "value": stats["total_request"]},
            {"label": "Accepted",       "value": stats["accepted"]},
            {"label": "Pending",        "value": stats["pending"]},
            {"label": "Rejected",       "value": stats["rejected"]},
            {"label": "Cancelled",      "value": stats["cancelled"]},
        ]

        return Response(stats_list, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"],permission_classes=[IsAuthenticated])
    def update_member_status(self, request):
        data = require_params(request.data, 'group_id','new_status', "member_id")
        group_id = data["group_id"]
        member_id = data["member_id"]
        new_status = data["new_status"]

        result = MembershipService.handle_status_update(group_id=group_id, member_id=member_id,new_status=new_status, acting_user_id=request.user.id)
        return Response(result)
    

    @action(detail=False, methods=["post"],permission_classes=[IsAuthenticated])
    def update_member_role(self, request):
        data = require_params(request.data, 'group_id','new_role', "member_id")
        group_id = data['group_id']
        member_id = data["member_id"]
        new_role = data["new_role"]
        result = MembershipService.handle_role_update(group_id=group_id, member_id=member_id, new_role=new_role, acting_user_id=request.user.id)
        return Response(result)

class SessionViewset(GroupRBACMixin, SearchMixin, ModelViewSet):
    queryset = Session.objects.select_related('group').all()
    serializer_class = SessionSerializer
    pagination_class = CustomPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group', 'session_type']
    resource_name = "session"


    def perform_create(self, serializer):
        instance = SessionService._create_session(serializer.validated_data)
        serializer.instance = instance

    def perform_update(self, serializer):
        instance = SessionService.update_session(self.get_object(), serializer.validated_data)
        serializer.instance = instance
    # upcoming session
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def upcoming(self, request):
        try:
            limit = int(request.query_params.get("limit", 2))
        except ValueError:
            limit = 2
        current_time = now()
        upcoming_sessions = Session.objects.filter(
            group__memberships__user=request.user,
            group__memberships__status=MemberShip.MemberShipStatus.ACCEPTED,
            start__gte=current_time,
            status=Session.SessionStatus.SCHEDULED
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
    pagination_class = CustomPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group', 'user','session']
    resource_name = "attendance"
    user_lookup_field = "user"
    
    # the client will hit this api every 30 second to record the activeness of the user
    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def heartbeat(self, request):
        data = require_params(request.data, "session_id")
        session_id = data["session_id"]
        result = AttendanceService.heartbeat(session_id, request.user)
        return Response(result)
    


class ResourceViewset(UserRelatedMixin, ModelViewSet):
    queryset = Resource.objects.select_related("uploader","group").all()
    serializer_class = ResourceSerializer
    pagination_class = CustomPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group', 'uploader']
    # resource_name = "resource"
    user_lookup_field = "uploader"

    def perform_create(self, serializer):
        file = self.request.FILES.get("file")
        instance = ResourceService._create_resource(serializer.validated_data, file)
        serializer.instance = instance



    def perform_update(self, serializer):
        file = self.request.FILES.get("file")
        user = self.request.user
        instance = ResourceService._update_resource(self.get_object(),user.id,serializer.validated_data, file)
        serializer.instance = instance


    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def record_download(self, request, pk=None):
        data = require_params(request.data, "group_id")
        group_id = data["group_id"]
        user_id =  request.user.id
        result = ResourceService._record_download(
            resource_id=pk,
            group_id=group_id,
            user_id=user_id
        )
        return Response(result)
    

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def record_view(self, request, pk=None):
        data = require_params(request.data, "group_id")
        group_id = data["group_id"]
        user_id =  request.user.id
        result = ResourceService._record_views(
            resource_id=pk,
            group_id=group_id,
            user_id=user_id
        )
        return Response(result)
    
