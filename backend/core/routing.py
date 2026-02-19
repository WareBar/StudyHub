from django.urls import re_path
from . import consumers

# Allow letters, numbers, underscores, and hyphens
websocket_urlpatterns = [
    re_path(r'ws/video/(?P<room_name>[\w-]+)/$', consumers.VideoConsumer.as_asgi()),
]
