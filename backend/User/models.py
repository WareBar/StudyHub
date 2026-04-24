from django.db import models
from django.contrib.auth.models import (
    BaseUserManager, AbstractBaseUser, PermissionsMixin
)
from django.utils import timezone
from django.contrib.contenttypes.fields import GenericRelation
from core.models import BaseModel
from core.querysets import BaseQuerySet
# from django.contrib.auth import get_user_model
# User = get_user_model()

class CustomUserManager(BaseUserManager):

    def get_queryset(self):
        return BaseQuerySet(self.model, using=self._db) 


    def create_user(self, username, email, last_name, first_name, password=None):
        """
        Creates and saves a User with the given username, name and password.
        """
        if not email:
            raise ValueError('Users must have an email address')

        user = self.model(
            username=username,
            last_name=last_name,
            first_name=first_name,
            email=self.normalize_email(email)
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, last_name, first_name, password=None):
        """
        Creates and saves a User with the given username, name and password.
        """
        user = self.create_user(
            username=username,
            last_name=last_name,
            first_name=first_name,
            email=self.normalize_email(email),
            password=password
        )
        user.is_admin = True
        user.is_superuser = True
        # user.is_staff = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):


    username = models.CharField(max_length=255, unique=True, null=True, blank=True)
    last_name = models.CharField(max_length=90, null=False, blank=False)
    first_name = models.CharField(max_length=90, null=False, blank=False)
    email = models.EmailField(
        verbose_name='email address',
        max_length=255,
        unique=True,
    )

    avatar = models.URLField(max_length=500, blank=True, null=True)


    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)

    # to track user activity
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(blank=True, null=False, default=timezone.now)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username','last_name','first_name']

    def __str__(self):
        return self.email

    @property
    def is_staff(self):
        "Is the user a member of staff?"
        # Simplest possible answer: All admins are staff
        return self.is_admin
    

class Profile(BaseModel):
    class EducationLevel(models.TextChoices):
        GRADE_SCHOOL = "GRADE",    "Grade School"
        JUNIOR_HIGH  = "JUNIOR",   "Junior High"
        SENIOR_HIGH  = "SENIOR",   "Senior High"
        COLLEGE      = "COLLEGE",  "College"
        POSTGRAD     = "POSTGRAD", "Post Graduate"

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")

    bio = models.TextField(blank=True)
    subjects_of_interest = models.ManyToManyField(
        "study.Subject",       # or just Subject if imported directly
        blank=True,
        related_name="subject_of_interest",
    )


    education_level = models.CharField(
        max_length=10,
        choices=EducationLevel.choices,
        blank=True,
    )

    facebook  = models.URLField(blank=True)  # most universal in PH especially
    github    = models.URLField(blank=True)  # relevant for tech learners
    linkedin  = models.URLField(blank=True)  # college and above

