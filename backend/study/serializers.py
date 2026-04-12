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
    Attendance
)
from User.serializers import UserSerializer
from User.models import User
from django.utils import timezone


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
    user = UserSerializer(read_only=True)
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
    creator_detail = UserSerializer(source="creator", read_only=True)
    subject_detail = SubjectSerializer(source="subject", read_only=True)
    # not foreignkey, just related
    # automatically no need to include source attribute in serializer arguments
    memberships = MemberShipSerializer(many=True, read_only=True)
    # so we only need the id to pass for save or data creation
    creator = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True)
    subject = serializers.PrimaryKeyRelatedField(queryset=Subject.objects.all(), write_only=True)

    # get the next session of the group
    next_session = SerializerMethodField()
    
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
    user_detail    = UserSerializer(source="user", read_only=True)
    session_detail = SessionSerializer(source="session", read_only=True)

    group   = serializers.PrimaryKeyRelatedField(queryset=StudyGroup.objects.all(), write_only=True)
    user    = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True)
    session = serializers.PrimaryKeyRelatedField(queryset=Session.objects.all(), write_only=True)

    class Meta:
        model  = Attendance
        fields = "__all__"



