from django.shortcuts import render
from User.models import User
from User.serializers import UserSerializer
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
# Create your views here.
from rest_framework.decorators import action
from rest_framework.response import Response
from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView


class UserViewset(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action in ['create']: #regiser new user
            permission_classes = [AllowAny] #no auth required when someone wants to register
        elif self.action in ['retrieve','update','partial_update','destroy']:
            permission_classes = [IsAuthenticated]
        elif self.action in ['list']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        # Non-admins can only see their own profile
        user = self.request.user
        if user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=user.id)
    
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
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