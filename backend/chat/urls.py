from django.urls import path, include
from rest_framework.routers import DefaultRouter
from chat.views import ChatViewset

router = DefaultRouter()
router.register("chat",ChatViewset, basename="chat")

urlpatterns = [
    path("",include(router.urls))
]
