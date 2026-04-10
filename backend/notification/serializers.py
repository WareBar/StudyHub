from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from notification.models import Notification
from User.serializers import UserSerializer


class NotificationSerializer(ModelSerializer):
    to = UserSerializer(many=False, read_only=False)
    class Meta:
        model = Notification
        fields = "__all__"