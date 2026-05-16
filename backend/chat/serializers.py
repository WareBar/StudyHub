from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from chat.models import Chat
from study.models import (
    MemberShip
)
from drf_spectacular.utils import extend_schema_field
from drf_spectacular.types import OpenApiTypes

class SenderSchema(serializers.Serializer):
    id = serializers.IntegerField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()
    avatar = serializers.CharField(allow_null=True)


class ReplyToSchema(serializers.Serializer):
    id = serializers.IntegerField()
    message = serializers.CharField(allow_null=True)
    attachments = serializers.CharField(allow_null=True)
    sender = SenderSchema()

class ChatSerializer(ModelSerializer):
    sender = serializers.SerializerMethodField()
    reply_to = serializers.SerializerMethodField()
    class Meta:
        model = Chat
        fields = "__all__"


    # check first if the sender is truly a member of the provided group
    # check if sender has existing membership to the group
    def validate(self, attrs):
        # get the group infor from the attr
        group = attrs.get("group")
        sender = attrs.get("sender")

        if group and sender:
            is_member = MemberShip.objects.filter(group=group, user=sender).exists()

            if not is_member:
                raise serializers.ValidationError(
                    {"membership": f"{sender.username} is not a member of {group.name}"}
                )
        return attrs
            


    # cant use sender or user seralizer since we need to nitpick information to show,
    @extend_schema_field(SenderSchema)
    def get_sender(self, obj):
        return {
            "id": obj.sender.id,
            "first_name": obj.sender.first_name,
            "last_name": obj.sender.last_name,
            "email": obj.sender.email,
            "avatar":obj.sender.avatar,
        }
    
    @extend_schema_field(ReplyToSchema(allow_null=True)) 
    def get_reply_to(self, obj):
        if not obj.reply_to:
            return None

        return {
            "id": obj.reply_to.id,
            "message": obj.reply_to.message,
            "attachments":obj.reply_to.attachments,
            "sender": {
                "id": obj.reply_to.sender.id,
                "first_name": obj.reply_to.sender.first_name,
                "last_name": obj.reply_to.sender.last_name,
                "avatar": obj.reply_to.sender.avatar,
            },
        }