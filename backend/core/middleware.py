# middleware.py
class FileSizeLimitMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        print("FileSizeLimitMiddleware running")  # remove after testing
        if request.method == "POST":
            content_length = request.headers.get("Content-Length")
            print(f"Content-Length: {content_length}")  # check if header exists
            if content_length and int(content_length) > 52428800:  # 50 MB
                from rest_framework.response import Response
                from django.http import JsonResponse
                return JsonResponse({
                    "code": "REACHED_FILE_SIZE_LIMIT",
                    "detail": "File exceeds 50 MB limit."
                }, status=400)
        return self.get_response(request)