from django.urls import path, include
from core.views import FileUploadViewset

urlpatterns = [
    path("core/file_upload/", FileUploadViewset.as_view(), name="file_upload")
]
