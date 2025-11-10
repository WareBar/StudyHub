from django.shortcuts import render
from User.models import User
from User.serializers import UserSerializer
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
# Create your views here.
from rest_framework.decorators import action
from rest_framework.response import Response


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