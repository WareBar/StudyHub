from core.models import BaseModel
from django.db import models
from User.models import User


class Notification(BaseModel):
    content = models.TextField(
        null=False,
        blank=False
    )
    is_read = models.BooleanField(
        default=False
    )
    # notification_type
    to = models.ForeignKey(
        User,
        null=False,
        blank=False,
        on_delete=models.CASCADE
    )

    def __str__(self):
        return f"{self.to.username}'s notification"