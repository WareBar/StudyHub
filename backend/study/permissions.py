from rest_framework.permissions import BasePermission
from study.models import MemberShip

# list of permission
class GroupPerms:
    # NO ADD GROUP, since all can do that
    VIEW_GROUP    = "view_group"
    EDIT_GROUP    = "edit_group"
    DELETE_GROUP  = "delete_group"

    ADD_MEMBERSHIP    = "add_membership"
    VIEW_MEMBERSHIP   = "view_membership"
    MANAGE_MEMBERSHIP = "manage_membership"

    VIEW_SESSION   = "view_session"
    ADD_SESSION    = "add_session"
    EDIT_SESSION   = "edit_session"
    DELETE_SESSION = "delete_session"

    VIEW_ATTENDANCE   = "view_attendance"
    ADD_ATTENDANCE    = "add_attendance"
    EDIT_ATTENDANCE   = "edit_attendance"
    DELETE_ATTENDANCE = "delete_attendance"

    VIEW_SUBJECT = "view_subject"
    ADD_SUBJECT = "add_subject"
    EDIT_SUBJECT = "edit_subject"
    DELETE_SUBJECT = "delete_subject"


# ------------------------------------------------------------------ #
#  Action → Codename convention                                        
#  Follows Django's add/view/change/delete pattern                    



RESOURCE_ACTION_MAP = {
    #  resource       list/retrieve        create          update               destroy
    "group":      {
        "read":   GroupPerms.VIEW_GROUP,
        "write":  GroupPerms.EDIT_GROUP,
        "add":    GroupPerms.ADD_MEMBERSHIP,  # creating a group = joining as creator
        "delete": GroupPerms.DELETE_GROUP,
    },
    "membership": {
        "read":   GroupPerms.VIEW_MEMBERSHIP,
        "add":    GroupPerms.ADD_MEMBERSHIP,
        "write":  GroupPerms.MANAGE_MEMBERSHIP,
        "delete": GroupPerms.MANAGE_MEMBERSHIP,
    },
    "session": {
        "read":   GroupPerms.VIEW_SESSION,
        "add":    GroupPerms.ADD_SESSION,
        "write":  GroupPerms.EDIT_SESSION,
        "delete": GroupPerms.DELETE_SESSION,
    },
    "attendance": {
        "read":   GroupPerms.VIEW_ATTENDANCE,
        "add":    GroupPerms.ADD_ATTENDANCE,
        "write":  GroupPerms.EDIT_ATTENDANCE,
        "delete": GroupPerms.DELETE_ATTENDANCE,
    },
    "subject": {
        "read": GroupPerms.VIEW_SUBJECT,
        "add": GroupPerms.ADD_SUBJECT,
        "write": GroupPerms.EDIT_SUBJECT,
        "delete": GroupPerms.DELETE_SUBJECT
    }
}

# Maps DRF actions to resource action keys
DRF_ACTION_TO_RESOURCE_ACTION = {
    "list":           "read",
    "retrieve":       "read",
    "create":         "add",
    "update":         "write",
    "partial_update": "write",
    "destroy":        "delete",
}


# ------------------------------------------------------------------ #
#  Role → Permissions                                                  #
# ------------------------------------------------------------------ #

ROLE_PERMISSIONS = {
    MemberShip.Role.MEMBER: {
        GroupPerms.VIEW_GROUP,
        GroupPerms.VIEW_MEMBERSHIP,
        GroupPerms.ADD_MEMBERSHIP,
        GroupPerms.VIEW_SESSION,
        GroupPerms.VIEW_ATTENDANCE,
        GroupPerms.ADD_ATTENDANCE,
        GroupPerms.VIEW_SUBJECT
    },
    MemberShip.Role.MODERATOR: {
        GroupPerms.VIEW_GROUP,
        GroupPerms.EDIT_GROUP,
        GroupPerms.VIEW_MEMBERSHIP,
        GroupPerms.ADD_MEMBERSHIP,
        GroupPerms.MANAGE_MEMBERSHIP,
        GroupPerms.VIEW_SESSION,
        GroupPerms.ADD_SESSION,
        GroupPerms.EDIT_SESSION,
        GroupPerms.VIEW_ATTENDANCE,
        GroupPerms.ADD_ATTENDANCE,
        GroupPerms.EDIT_ATTENDANCE,
        GroupPerms.DELETE_ATTENDANCE,
        GroupPerms.VIEW_SUBJECT
    },
    MemberShip.Role.CREATOR: {
        # pull everything from RESOURCE_ACTION_MAP automatically
        perm
        for resource in RESOURCE_ACTION_MAP.values()
        for perm in resource.values()
    },
}


# ------------------------------------------------------------------ #
#  Permission Class                                                    #
# ------------------------------------------------------------------ #

class GroupPermission(BasePermission):
    """
    Resolves required permission from:
        view.resource_name + view.action → RESOURCE_ACTION_MAP → codename
        membership.role                  → ROLE_PERMISSIONS    → allowed codenames

    Viewsets only need to declare:
        resource_name = "session"
    """
    def _resolve_group(self, obj=None, request=None):
        from study.models import StudyGroup
        if obj is not None:
            if isinstance(obj, StudyGroup):
                return obj
            return getattr(obj, "group", None)
        if request is not None:
            group_pk = (
                request.data.get("group")
                or request.query_params.get("group")
            )
            if group_pk:
                try:
                    return StudyGroup.objects.get(pk=group_pk)
                except StudyGroup.DoesNotExist:
                    return None
        return None

    def _get_membership(self, user, group):
        try:
            return MemberShip.objects.get(
                user=user,
                group=group,
                status=MemberShip.MemberShipStatus.ACCEPTED,
            )
        except MemberShip.DoesNotExist:
            return None

    def _resolve_required_perm(self, view):
        resource_name = getattr(view, "resource_name", None)
        if not resource_name:
            return None
        resource_map   = RESOURCE_ACTION_MAP.get(resource_name, {})
        resource_action = DRF_ACTION_TO_RESOURCE_ACTION.get(view.action)
        return resource_map.get(resource_action)

    def _check(self, request, view, obj=None):
        # list is public — no auth or membership required
        if view.action == "list":
            return True

        # public read for group detail
        resource_name = getattr(view, "resource_name", None)
        if view.action == "retrieve" and resource_name == "group":
            return True


        if not request.user or not request.user.is_authenticated:
            self.message = "Authentication required."
            return False

        group = self._resolve_group(obj=obj, request=request)
        if group is None:
            return True

        membership = self._get_membership(request.user, group)
        if not membership:
            self.message = "You are not an accepted member of this group."
            return False

        required_perm = self._resolve_required_perm(view)
        if required_perm is None:
            return False

        allowed_perms = ROLE_PERMISSIONS.get(membership.role, set())
        if required_perm not in allowed_perms:
            self.message = "You do not have permission to perform this action."
            return False
        return True

    def has_permission(self, request, view):
        return self._check(request, view)

    def has_object_permission(self, request, view, obj):
        return self._check(request, view, obj=obj)
    
