from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from chat.models import Chat
from study.models import (
    MemberShip
)

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
    def get_sender(self, obj):
        return {
            "id": obj.sender.id,
            "first_name": obj.sender.first_name,
            "last_name": obj.sender.last_name,
            "email": obj.sender.email,
            "avatar":obj.sender.avatar,
        }
    
    def get_reply_to(self, obj):
        if not obj.reply_to:
            return None

        return {
            "id": obj.reply_to.id,
            "content": obj.reply_to.content,
            "content_type":obj.reply_to.content_type,
            "sender": {
                "id": obj.reply_to.sender.id,
                "first_name": obj.reply_to.sender.first_name,
                "last_name": obj.reply_to.sender.last_name,
                "avatar": obj.reply_to.sender.avatar,
            },
        }