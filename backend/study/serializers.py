"""
SERIALIZER IS CONCERNED WITH DATA VALIDATION AND ETC CONCERCNING DATAS
"""


from rest_framework.serializers import ModelSerializer, SerializerMethodField
from rest_framework import serializers
from study.models import (
    StudyGroup,
    Subject,
    MemberShip,
    Session,
    Attendance,
    Resource
)
from User.simple_serializers import SimpleUserSerializer
from User.models import User
from django.utils import timezone
from drf_spectacular.utils import extend_schema_field
from drf_spectacular.types import OpenApiTypes

# lightweight serializer
class StudyGroupSimpleSerializer(ModelSerializer):
    class Meta:
        model = StudyGroup
        fields = ["id", "name","description"]  # keep it minimal
    
class SessionSimpleSerializer(ModelSerializer):
    class Meta:
        model = Session
        fields = ["id", "start", "end", "status"]

class MemberShipSerializer(ModelSerializer):
    user = SimpleUserSerializer(read_only=True)
    class Meta:
        model = MemberShip
        fields = "__all__"

    # validates if maximmum allowed numbers is reached
    def validate(self, attrs):
        group = attrs.get("group")

        if group:
            current_members = MemberShip.objects.filter(
                group=group,
                status=MemberShip.MemberShipStatus.ACCEPTED
            ).count()

            if current_members >= group.max_members:
                raise serializers.ValidationError(
                    {"group": f"This group has reached its maximum capacity of {group.max_members} members."}
                )

        return attrs




class SubjectSerializer(ModelSerializer):
    class Meta:
        model = Subject
        fields = "__all__"


class StudyGroupSerializer(ModelSerializer):
    # foreign keys, means it required in the submission
    creator_detail = SimpleUserSerializer(source="creator", read_only=True)
    subject_detail = SubjectSerializer(source="subject", read_only=True)
    # not foreignkey, just related
    # automatically no need to include source attribute in serializer arguments
    memberships = SerializerMethodField()
    # so we only need the id to pass for save or data creation
    creator = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True)
    subject = serializers.PrimaryKeyRelatedField(queryset=Subject.objects.all(), write_only=True)

    # get the next session of the group
    next_session = SerializerMethodField()
    total_sessions = SerializerMethodField()
    membership_status = SerializerMethodField()

    class Meta:
        model = StudyGroup
        fields = "__all__"

    # auto create membership for the creator
    def create(self, validated_data):
        group   = StudyGroup.objects.create(**validated_data)
        MemberShip.objects.create(
            group=group,
            user=group.creator,
            role=MemberShip.Role.CREATOR,
            status=MemberShip.MemberShipStatus.ACCEPTED,
        )
        return group

    # get accepted membership
    @extend_schema_field(MemberShipSerializer(many=True))
    def get_memberships(self, obj):
        data = obj.memberships.filter(status=MemberShip.MemberShipStatus.ACCEPTED)
        return MemberShipSerializer(data, many=True, read_only=True).data

    @extend_schema_field(SessionSimpleSerializer(allow_null=True))
    def get_next_session(self, obj):
        today = timezone.now()

        next_session = Session.objects.filter(
            group=obj,
            status=Session.SessionStatus.SCHEDULED,
            start__gte=today
        ).order_by("start").first()

        if next_session:
            return SessionSimpleSerializer(next_session).data
        return None
    
    @extend_schema_field(OpenApiTypes.INT)
    def get_total_sessions(self, obj):
        all_sessions = obj.sessions.all().count()
        return all_sessions

    # to check if the logged in user is member, not member, or has pending membership request
    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_membership_status(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return None
        membership_instance = MemberShip.objects.filter(
            user=request.user,
            group=obj
        ).first()

        if not membership_instance: return None

        return membership_instance.status
            

class SessionSerializer(ModelSerializer):
    group_detail = StudyGroupSimpleSerializer(source="group", read_only=True)
    group        = serializers.PrimaryKeyRelatedField(
        queryset=StudyGroup.objects.all(), write_only=True
    )
    class Meta:
        model  = Session
        fields = "__all__"

class AttendanceSerializer(ModelSerializer):
    group_detail   = StudyGroupSerializer(source="group", read_only=True)
    user_detail    = SimpleUserSerializer(source="user", read_only=True)
    session_detail = SessionSerializer(source="session", read_only=True)

    group   = serializers.PrimaryKeyRelatedField(queryset=StudyGroup.objects.all(), write_only=True)
    user    = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True)
    session = serializers.PrimaryKeyRelatedField(queryset=Session.objects.all(), write_only=True)

    class Meta:
        model  = Attendance
        fields = "__all__"


class ResourceSerializer(ModelSerializer):
    group_detail   = StudyGroupSerializer(source="group", read_only=True)
    uploader_detail    = SimpleUserSerializer(source="uploader", read_only=True)
    group   = serializers.PrimaryKeyRelatedField(queryset=StudyGroup.objects.all(), write_only=True)
    uploader    = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True)


    class Meta:
        model = Resource
        fields = "__all__"
        read_only_fields = ["url"] # frontend doesn't send it, backend sets it
        


