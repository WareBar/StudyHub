from rest_framework.viewsets import ModelViewSet
from notification.models import Notification
from notification.serializers import NotificationSerializer
from django_filters.rest_framework import DjangoFilterBackend
from core.pagination import CustomPagination

class NotificationViewset(ModelViewSet):
    queryset = Notification.objects.select_related("to").all()
    serializer_class = NotificationSerializer
    pagination_class = CustomPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["is_read"]