from django.urls import path, include
from rest_framework.routers import DefaultRouter
from notification.views import NotificationViewset


router = DefaultRouter()
router.register("notification",NotificationViewset, basename="notification")

urlpatterns = [
    path("",include(router.urls))
]
