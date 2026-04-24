from rest_framework.response import Response
from User.models import User
from User.serializers import UserSerializer, ProfileSerializer
from User.simple_serializers import SimpleUserSerializer
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
# Create your views here.
from rest_framework.decorators import action
from rest_framework.response import Response
from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from core.validators import require_params
from .services import UserService
from rest_framework.exceptions import NotAcceptable
from core.mixins import SearchMixin
from core.pagination import CustomPagination

class UserViewset(SearchMixin,ModelViewSet):
    queryset = User.objects.all()
    search_fields = ["username", "email", "first_name","last_name"]
    pagination_class = CustomPagination


    def get_serializer_class(self):
        if self.request.user.is_staff or self.request.user.is_superuser:
            return UserSerializer        # full serializer
        return SimpleUserSerializer      # limited fields

    def get_permissions(self):
        if self.action in ['create']: #regiser new user
            permission_classes = [AllowAny] #no auth required when someone wants to register
        elif self.action in ['retrieve','update','partial_update','destroy']:
            permission_classes = [IsAuthenticated]
        elif self.action in ['list']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return User.objects.all()
        if self.action in ['retrieve', 'profile']:
            return User.objects.all()
        if self.action == 'list':
            # search = self.request.query_params.get('search', '')
            # if not search:
            #     return User.objects.none()  # no search term = no results
            return User.objects.all()       # SearchMixin filters from here
        return User.objects.filter(id=user.id)
    
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    

    # to get the user kpi
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def stats(self, request):
        user_id = request.query_params.get("user_id")
        if not user_id:
            raise NotAcceptable({
                "detail": "User id is required",
                "code": "MISSING_USER_ID"
            })
        user_id = int(user_id)
        result = UserService.get_stats(user_id=user_id)
        return Response(result)


    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated])
    def profile(self, request, pk=None):
        user = self.get_object()  # gets the User by pk
        profile = user.profile    # OneToOne so it's a direct access, not .all()
        serializer = ProfileSerializer(profile, many=False)
        return Response(serializer.data)


    # to hash the user password when registering
    def perform_create(self, serializer):
        user = serializer.save()
        user.set_password(user.password)
        user.save()




# handle the  google login
# this login if that user does not exist, and auto register the user using google info
# in get_or_create
class GoogleOAuthLogin(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        token = request.data.get('token')
        try:
            # Verify Google token
            idinfo = id_token.verify_oauth2_token(token, requests.Request())
            email = idinfo['email']
            name = idinfo.get('name', email.split('@')[0])
            picture = idinfo.get('picture', '')

            # Create or get user
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': name,
                    'avatar':picture
                }
                

            )

            # Issue JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'avatar': picture,
                }
            })
        except Exception as e:
            return Response({'error': str(e)}, status=400)