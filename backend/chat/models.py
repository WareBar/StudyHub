from core.models import BaseModel
from study.models import StudyGroup
from User.models import User
from django.db import models




class Chat(BaseModel):
    class ChatType(models.TextChoices):
        TEXT = "text"
        IMAGE = "image"
        VIDEO = "video"


    chat_type = models.CharField(
        max_length=20,
        choices=ChatType.choices,
        default=ChatType.TEXT
    )
    message = models.TextField(
        null=False,
        blank=False
    )
    group = models.ForeignKey(
        StudyGroup,
        on_delete=models.CASCADE,
        null=False,
        blank=False
    )
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
        return f"{self.sender.username}'s message on {self.group.name}"
    


