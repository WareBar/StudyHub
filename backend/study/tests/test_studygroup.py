"""
This focuses on:

join request
duplicate join prevention
cancel logic

"""


from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError

from study.models import StudyGroup, MemberShip, Subject
from study.services import StudyGroupService

User = get_user_model()


class StudyGroupServiceTests(TestCase):
    def create_user(self, username):
        return User.objects.create_user(
            username=username,
            email=f"{username}@test.com",
            first_name="Test",
            last_name="User",
            password="123"
        )

    def setUp(self):
        self.user = self.create_user("user1")
        self.subject = Subject.objects.create(name="Math")
        self.group = StudyGroup.objects.create(
            name="Test Group",
            description="Desc",
            max_members=5,
            creator=self.user,
            subject=self.subject
        )

    def test_join_creates_pending_membership(self):
        response = StudyGroupService.membership_request(
            "join",
            self.group.id,
            self.user.id
        )

        self.assertEqual(response["status"], MemberShip.MemberShipStatus.PENDING)

        membership = MemberShip.objects.get(user=self.user, group=self.group)
        self.assertEqual(membership.status, MemberShip.MemberShipStatus.PENDING)

    def test_join_fails_if_already_member(self):
        MemberShip.objects.create(
            user=self.user,
            group=self.group,
            status=MemberShip.MemberShipStatus.ACCEPTED
        )

        with self.assertRaises(ValidationError):
            StudyGroupService.membership_request(
                "join",
                self.group.id,
                self.user.id
            )

    def test_join_fails_if_already_pending(self):
        MemberShip.objects.create(
            user=self.user,
            group=self.group,
            status=MemberShip.MemberShipStatus.PENDING
        )

        with self.assertRaises(ValidationError):
            StudyGroupService.membership_request(
                "join",
                self.group.id,
                self.user.id
            )

    def test_cancel_pending_membership(self):
        membership = MemberShip.objects.create(
            user=self.user,
            group=self.group,
            status=MemberShip.MemberShipStatus.PENDING
        )

        response = StudyGroupService.membership_request(
            "cancel",
            self.group.id,
            self.user.id
        )

        self.assertEqual(response["status"], "none")
        self.assertFalse(
            MemberShip.objects.filter(id=membership.id).exists()
        )

    def test_cancel_fails_if_not_pending(self):
        MemberShip.objects.create(
            user=self.user,
            group=self.group,
            status=MemberShip.MemberShipStatus.ACCEPTED
        )

        with self.assertRaises(ValidationError):
            StudyGroupService.membership_request(
                "cancel",
                self.group.id,
                self.user.id
            )