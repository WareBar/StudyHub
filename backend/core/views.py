from core.services import CoreService
from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.exceptions import RequestDataTooBig

class FileUploadViewset(APIView):
    def post(self, request):
        try:
            file = request.FILES.get("file")
        except RequestDataTooBig:
            return Response({"code": "REACHED_FILE_SIZE_LIMIT", "detail": "File exceeds 50 MB limit."}, status=400)
        try:
            result = CoreService.upload_file(file)
        except ValueError as e:
            return Response(e.args[0], status=400)
        except RuntimeError as e:
            return Response(e.args[0], status=500)
        return Response(result)