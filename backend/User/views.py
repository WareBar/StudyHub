from rest_framework.response import Response
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
from django.utils import timezone
from datetime import timedelta


# external
from study.models import (
    StudyGroup,
    MemberShip,
    Session,
    Attendance
)

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
    

    # to get the user kpi
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def stats(self, request):
        # get the logged in user
        user = request.user

        # kpis
        """
        Total study group joined
        Total session this week
        Total Active Time on the Site or studyhours
        Attendance Rate across all study groop
        """
        # getting user total studygroup where he belong
        memberships = MemberShip.objects.filter(user=user)
        total_groups = memberships.count()


        # getting number of session this week
        today = timezone.now()
        # this week — Monday to Sunday
        this_week_start = today - timedelta(days=today.weekday())
        this_week_end   = this_week_start + timedelta(days=7)
        # last week
        last_week_start = this_week_start - timedelta(days=7)


        sessions = Session.objects.filter(
            group__memberships__user=user,
            group__memberships__status=MemberShip.MemberShipStatus.ACCEPTED,
            start__gte=last_week_start,  # ← double underscore
            start__lt=this_week_end      # ← double underscore
        )

        if sessions.count() > 0:
            # split by week boundary
            last_week_sessions = sessions.filter(start__lt=this_week_start)
            this_week_sessions = sessions.filter(start__gte=this_week_start)
            sessions_difference = this_week_sessions.count() - last_week_sessions.count()

        # getting attendance rate
        attendace = Attendance.objects.filter(user=user)

        if attendace.count() > 0:
            absents = attendace.filter(status=Attendance.AttendanceStatus.ABSENT).count()
            attendance_rate = (
                (attendace.count() - absents) / attendace.count()
            ) * 100

        # getting study total hours in seconds
        total_seconds = 0
        for a in attendace:
            if a.session.session_type == a.session.SessionTypes.PHYSICAL:
                if a.check_in_time and a.check_out_time:
                    total_seconds += (a.check_out_time - a.check_in_time).total_seconds()
            else:  # ONLINE
                total_seconds += a.total_active_seconds or 0

        total_hours = round(total_seconds / 3600, 2)

        data = [
            {
                "title":"Study Groups",
                "content":total_groups,
                "sub_content":"haha"
            },
            {
                "title":"Sessions This Week",
                "content": this_week_sessions.count() if sessions.count() > 0 else 0,
                "sub_content":f"{sessions_difference if sessions.count() > 0 else 0} last week"
            },
            {
                "title":"Study Hours",
                "content":total_hours,
                "sub_content":"Wow sipag ah"
            },
            {
                "title":"Attendance Rate",
                "content":f"{attendance_rate if attendace.count() > 0 else 0}%",
                "sub_content": "great"
            },
        ]
        return Response(data)
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