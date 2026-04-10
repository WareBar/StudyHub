from django.urls import path, include
from rest_framework.routers import DefaultRouter
from study.views import (
    StudyGroupViewset,
    SubjectViewset,
    MemberShipViewset,
    SessionViewset,
    AttendanceViewset
)


router = DefaultRouter()
router.register("study-group",StudyGroupViewset, basename="study-group")
router.register("subject",SubjectViewset, basename="subject")
router.register("membership",MemberShipViewset, basename="membership")
router.register("session",SessionViewset, basename="session")
router.register("attendance",AttendanceViewset, basename="attendance")

urlpatterns = [
    path("",include(router.urls))
]
