from core.validators import DateRangeValidator
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from study.permissions import GroupPermission

class DateFilterViewSetMixin:
    date_field = "created_at"

    def filter_queryset(self, qs):
        # First, let other backends filter (e.g status, is_featured, etc.)
        qs = super().filter_queryset(qs)

        # Then apply date filter
        params = self.request.query_params
        start_date = params.get("start_date")
        end_date = params.get("end_date")


        DateRangeValidator.validate(start_date, end_date)
        return qs.between(self.date_field, start_date, end_date)


class SearchMixin:
    search_fields = []

    def filter_queryset(self, qs):
        qs = super().filter_queryset(qs)

        keyword = self.request.query_params.get("search")

        if keyword:
            qs = qs.search(self.search_fields, keyword)

        return qs



class AdminOnlyMixin:
    """
    Restricts access to admin users only.
    Any ViewSet inheriting this becomes admin-protected.
    """
    permission_classes = [IsAdminUser, IsAuthenticated]


class GroupRBACMixin:
    """
    Simply wires GroupPermission into any ModelViewSet.
    Subclasses only need to declare resource_name.

    Example:
        class SessionViewset(GroupRBACMixin, ModelViewSet):
            resource_name = "session"
    """
    permission_classes = [GroupPermission]

class UserRelatedMixin:
    """
    Filters queryset based on user relationship.
    Supports:
    - ?type=my
    """
    user_lookup_field = "user"
    extra_filters = {}

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset) #runs previous filters then apply this filter

        response_type = self.request.query_params.get("type")
        if response_type == "my":
            # checks auth
            user = self.request.user
            if not user.is_authenticated:
                return queryset.none()      
            filters = {
                self.user_lookup_field: self.request.user
            }
            filters.update(self.extra_filters)

            return queryset.filter(**filters)

        return queryset