from celery import shared_task
from django.utils import timezone
from study.models import Session

@shared_task
def cleanup_finished_sessions():
    now = timezone.now()

    # get all session past their end times
    finished = Session.objects.filter(
        status=Session.SessionStatus.SCHEDULED,
        end__lte=now
    )
    count = finished.count()  # capture before update
    # update all their statuys to finished
    finished.update(status=Session.SessionStatus.FINISHED)
    print(f'Cleaned {count} sessions')