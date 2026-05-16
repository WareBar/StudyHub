from rest_framework.viewsets import ModelViewSet
from chat.models import Chat
from chat.serializers import ChatSerializer
from django_filters.rest_framework import DjangoFilterBackend
from core.pagination import CustomPagination
from chat.filters import ChatFilter

class ChatViewset(ModelViewSet):
    queryset = Chat.objects.select_related("content_type","sender","reply_to", "reply_to__sender").all()
    serializer_class = ChatSerializer
    pagination_class = CustomPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = ChatFilter
    