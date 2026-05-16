from django.urls import path
from chat.consumers import ChatConsumer


websocket_urlpatterns = [
    path("ws/group/<int:group_id>/chat/", ChatConsumer.as_asgi()),
    path("ws/session/<int:session_id>/chat/", ChatConsumer.as_asgi()),
]