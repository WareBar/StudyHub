from User.models import User, Profile
from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from study.serializers import SubjectSerializer
from study.models import Subject

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"
        extra_kwargs = {
            "password": {"write_only": True}
        }

class ProfileSerializer(ModelSerializer):
    user = UserSerializer(many=False)
    subjects_of_interest_detail = SubjectSerializer(source="subjects_of_interest", read_only=True, many=True)
    subjects_of_interest = serializers.PrimaryKeyRelatedField(queryset=Subject.objects.all(), write_only=True)

    class Meta:
        model = Profile
        fields = "__all__"