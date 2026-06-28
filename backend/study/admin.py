from django.contrib import admin

from study.models import (
    StudyGroup,
    MemberShip,
    Attendance,
    Session, Subject, Resource, ResourceViews
)

admin.site.register(StudyGroup)
admin.site.register(MemberShip)
admin.site.register(Attendance)
admin.site.register(Session)
admin.site.register(Subject)
admin.site.register(Resource)
admin.site.register(ResourceViews)