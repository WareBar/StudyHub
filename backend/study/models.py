from django.db import models
from core.models import BaseModel
from User.models import User
from django.utils import timezone
# Create your models here.

class StudyGroup(BaseModel):
    name = models.CharField(max_length=80, unique=True, blank=False, null=False)
    description = models.TextField(blank=False, null=False)
    subject = models.ForeignKey(
        "Subject",
        null=False,
        blank=False,
        on_delete=models.DO_NOTHING,
        related_name="groups"
    )
    max_members = models.IntegerField(null=False, blank=False, default=6)
    creator = models.ForeignKey(
        User,
        null=False,
        blank=False,
        on_delete=models.DO_NOTHING,
        related_name="created_groups"
    )
    def __str__(self):
        return self.name
    
class Subject(BaseModel):   
    name = models.CharField(max_length=50, unique=True, blank=False, null=False)
    def __str__(self):
        return self.name

class MemberShip(BaseModel):
    class MemberShipStatus(models.TextChoices):
        ACCEPTED = "accepted"
        REJECTED = "rejected"
        PENDING = "pending"
        CANCELLED = "cancelled"

    class Role(models.TextChoices):
        CREATOR = "creator"
        MODERATOR = "moderator"
        MEMBER = "member"

    group = models.ForeignKey(
        StudyGroup,
        null=False,
        blank=False,
        on_delete=models.CASCADE,
        related_name="memberships"
    )
    user = models.ForeignKey(
        User,
        null=False,
        blank=False,
        on_delete=models.CASCADE,
        related_name="memberships"
    )
    status = models.CharField(
        max_length=10,
        choices=MemberShipStatus.choices,
        default=MemberShipStatus.PENDING,
        null=False,
        blank=False
    )
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.MEMBER,
        null=False,
        blank=False
    )
    class Meta:
        unique_together = ["group","user"]
        # this is to avoid having the same membership being recorded

    def __str__(self):
        return f"{self.user.username}'s {self.group.name} membership"

class Session(BaseModel):
    # add status here if,session is finished, or schedlued or on-going
    # to track the session status easily and not relying on the start and end attr
    class SessionStatus(models.TextChoices):
        FINISHED = "finished"
        SCHEDULED = "scheduled"
        ON_GOING =  "on_going"
        CANCELLED = "cancelled"
    class SessionTypes(models.TextChoices):
        ONLINE = "online"
        PHYSICAL = "physical"
    group = models.ForeignKey(
        StudyGroup,
        null=False,
        blank=False,
        on_delete=models.CASCADE,
        related_name="sessions"
    )
    session_type = models.CharField(
        max_length=10,
        choices=SessionTypes.choices,
        default=SessionTypes.ONLINE
    )
    status = models.CharField(
        max_length=20, 
        choices=SessionStatus.choices,
        default=SessionStatus.SCHEDULED
    )
    start = models.DateTimeField()
    end = models.DateTimeField()
    location = models.CharField( 
        max_length=200,
        null=True,
        blank=True, #optional fields since we have online and face to face session types
    )
    notes = models.TextField(blank=False, null=False)

    def __str__(self):
        return f"{self.group.name}'s {self.session_type} session at {self.location}"

class Attendance(BaseModel):
    class AttendanceStatus(models.TextChoices):
        PRESENT = 'present'
        ABSENT = 'absent'
        LATE = 'late'

    group = models.ForeignKey(
        StudyGroup,
        null=False,
        blank=False,
        on_delete=models.CASCADE,
        related_name="attendances"
    )
    user = models.ForeignKey(
        User,
        null=False,
        blank=False,
        on_delete=models.CASCADE,
        related_name="attendances"
    )
    session = models.ForeignKey(
        Session,
        null=False,
        blank=False,
        on_delete=models.DO_NOTHING,
        related_name="attendances"
    )
    status = models.CharField(
        max_length=20,
        choices=AttendanceStatus.choices,
        default=AttendanceStatus.ABSENT
    )
    # to determine if the user left or in the attendance before sending a heartbeat
    is_active = models.BooleanField(default=True)

    # to calculate the users study time in the session
    check_in_time = models.DateTimeField(default=timezone.now)
    check_out_time = models.DateTimeField(null=True, blank=True)

    total_active_seconds = models.IntegerField(default=0)
    last_active = models.DateTimeField(null=True, blank=True)

    def duration(self):
        if self.check_out_time:
            return (self.check_out_time - self.check_in_time).total_seconds()
        return 0

    def __str__(self):
        return f"{self.user.username}'s attendance on {self.group.name}"


class Resource(BaseModel):
    class ResourceType(models.TextChoices):
        FILE = "file"
        LINK = "link"
        # Will be adding more here        

    name = models.CharField(
        max_length=100, null=False, blank=False
    )
    description = models.CharField(
        max_length=300, null=True, blank=True
    )
    url = models.URLField(
        null=False, blank=False, default="/"
    )
    resource_type = models.CharField(
        max_length=10, null=False, blank=False, default=ResourceType.LINK
    )
    group = models.ForeignKey(
        StudyGroup, on_delete=models.DO_NOTHING, null=False, blank=False
    )
    uploader = models.ForeignKey(
        User, on_delete=models.DO_NOTHING, null=False, blank=False   
    )

    def __str__(self):
        return f"{self.uploader.email}'s {self.name}"



# For analytical purposes
class ResourceDownload(BaseModel):
    """To track the user that downloaded the resource and how many times"""
    resource = models.ForeignKey(
        Resource,
        on_delete=models.CASCADE,
        null=False, blank=False
        )
    user = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        null=False, blank=False
    )
    count = models.PositiveIntegerField(
        default=0
    )

# For analytical purposes

class ResourceViews(BaseModel):
    """To track the user that views the resource and how many times"""
    resource = models.ForeignKey(
        Resource,
        on_delete=models.CASCADE,
        null=False, blank=False
        )
    user = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        null=False, blank=False
    )
    count = models.PositiveIntegerField(
        default=0
    )
