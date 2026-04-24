from User.models import User
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError, NotFound, PermissionDenied
from django.db import transaction
from study.models import MemberShip, Session, Attendance
from django.utils import timezone
from datetime import timedelta

class UserService:
    @staticmethod
    def get_stats(user_id:int) -> dict:
        # kpis
        """
        Total study group joined
        Total session this week
        Total Active Time on the Site or studyhours
        Attendance Rate across all study groop
        """

        user = get_object_or_404(User, id=user_id)

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

        return data
    






