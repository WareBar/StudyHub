from rest_framework.viewsets import ModelViewSet
from chat.models import Chat
from chat.serializers import ChatSerializer
from django_filters.rest_framework import DjangoFilterBackend
from core.pagination import CustomPagination


class ChatViewset(ModelViewSet):
    queryset = Chat.objects.select_related("group","sender","reply_to").all()
    serializer_class = ChatSerializer
    pagination_class = CustomPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['group', 'sender']
    