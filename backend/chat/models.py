from core.models import BaseModel
from study.models import StudyGroup
from User.models import User
from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

# session and study group has connected chat


class Chat(BaseModel):

    # so this model can be foreignkey'd to session or group
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True, default=1)
    content_object = GenericForeignKey('content_type', 'object_id')
    # to support mutiple link attachment per chat or message
    attachments = models.TextField(null=True)
    message = models.CharField(max_length=1000, null=True)

    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=False,
        blank=False
    )
    reply_to = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="replies"
    )
    def __str__(self):
        return f"{self.sender.username}'s message on {self.content_object}"
    


