from django.urls import path
from video.consumers import VideoConsumer

websocket_urlpatterns = [
    path("ws/video/<str:group_id>/<str:session_id>/", VideoConsumer.as_asgi()),
]