from rest_framework.viewsets import ModelViewSet
from notification.models import Notification
from notification.serializers import NotificationSerializer
from django_filters.rest_framework import DjangoFilterBackend


class NotificationViewset(ModelViewSet):
    queryset = Notification.objects.select_related("to").all()
    serializer_class = NotificationSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["is_read"]