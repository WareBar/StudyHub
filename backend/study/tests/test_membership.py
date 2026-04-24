from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError, PermissionDenied

from study.models import StudyGroup, MemberShip, Subject
from study.services import MembershipService

User = get_user_model()


class MembershipServiceTests(TestCase):
    def create_user(self, username):
        return User.objects.create_user(
            username=username,
            email=f"{username}@test.com",
            first_name="Test",
            last_name="User",
            password="123"
        )
    
    def setUp(self):
        self.user1 = self.create_user("user1")  # creator
        self.user2 = self.create_user("user2")
        self.user3 = self.create_user("user3")

        self.subject = Subject.objects.create(name="Math")

        self.group = StudyGroup.objects.create(
            name="Test Group",
            description="Desc",
            max_members=2,
            creator=self.user1,
            subject=self.subject
        )

        MemberShip.objects.create(
            user=self.user1,
            group=self.group,
            status="accepted",
            role="creator"
        )


    def test_accept_membership_by_creator(self):
        # user2 is pending
        MemberShip.objects.create(
            user=self.user2,
            group=self.group,
            status="pending",
            role="member"
        )

        MembershipService.handle_status_update(
            user_id=self.user2.id,
            acting_user_id=self.user1.id,  #  creator acts
            group_id=self.group.id,
            new_status="accepted"
        )

        membership = MemberShip.objects.get(user=self.user2)
        self.assertEqual(membership.status, "accepted")

    def test_accept_fails_when_group_full(self):
        # fill capacity (creator already 1)
        MemberShip.objects.create(
            user=self.user2,
            group=self.group,
            status="accepted",
            role="member"
        )

        # pending user
        MemberShip.objects.create(
            user=self.user3,
            group=self.group,
            status="pending",
            role="member"
        )

        with self.assertRaises(ValidationError):
            MembershipService.handle_status_update(
                user_id=self.user3.id,
                acting_user_id=self.user1.id,  # creator tries
                group_id=self.group.id,
                new_status="accepted"
            )

    def test_accept_fails_if_not_authorized(self):
        # user2 is just a member
        MemberShip.objects.create(
            user=self.user2,
            group=self.group,
            status="accepted",
            role="member"
        )

        # user3 is pending
        MemberShip.objects.create(
            user=self.user3,
            group=self.group,
            status="pending",
            role="member"
        )

        with self.assertRaises(PermissionDenied):
            MembershipService.handle_status_update(
                user_id=self.user3.id,
                acting_user_id=self.user2.id,  
                group_id=self.group.id,
                new_status="accepted"
            )


    def test_update_role_success_by_creator(self):
        MemberShip.objects.create(
            user=self.user2,
            group=self.group,
            status="accepted",
            role="member"
        )

        MembershipService.handle_role_update(
            user_id=self.user2.id,
            acting_user_id=self.user1.id,
            group_id=self.group.id,
            new_role="moderator"
        )

        membership = MemberShip.objects.get(user=self.user2)
        self.assertEqual(membership.role, "moderator")

    def test_update_role_fails_if_same(self):
        MemberShip.objects.create(
            user=self.user2,
            group=self.group,
            status="accepted",
            role="member"
        )

        with self.assertRaises(ValidationError):
            MembershipService.handle_role_update(
                user_id=self.user2.id,
                acting_user_id=self.user1.id,
                group_id=self.group.id,
                new_role="member"
            )

    def test_update_role_fails_if_not_authorized(self):
        # both are just members
        MemberShip.objects.create(
            user=self.user2,
            group=self.group,
            status="accepted",
            role="member"
        )

        MemberShip.objects.create(
            user=self.user3,
            group=self.group,
            status="accepted",
            role="member"
        )

        with self.assertRaises(PermissionDenied):
            MembershipService.handle_role_update(
                user_id=self.user2.id,
                acting_user_id=self.user3.id,
                group_id=self.group.id,
                new_role="moderator"
            )