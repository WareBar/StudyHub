"""
This is for filters or pre-made queryset shared accross models, chained to BaseModel
intended to be resuable and chainable filters

"""
from django.db import models
from django.db.models import Q

class BaseQuerySet(models.QuerySet):
    """
    Global filters shared across models
    """

    # Date range filter (created_at, updated_at, etc.)
    def between(self, field, start_date=None, end_date=None):
        filters = {}
        if start_date:
            filters[f"{field}__gte"] = start_date
        if end_date:
            filters[f"{field}__lte"] = end_date
        return self.filter(**filters)

    # Simple search
    def search(self, fields, keyword):
        if not keyword:
            return self

        query = Q()
        for field in fields:
            query |= Q(**{f"{field}__icontains": keyword})

        return self.filter(query)