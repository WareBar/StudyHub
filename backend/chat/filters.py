# chat/filters.py
# we do this, incase we use generic foreignkey, to clean the structure
import django_filters
from django.contrib.contenttypes.models import ContentType
from chat.models import Chat
from study.models import StudyGroup, Session  # adjust imports


class ChatFilter(django_filters.FilterSet):
    sender = django_filters.NumberFilter(field_name='sender_id')
    group = django_filters.NumberFilter(method='filter_group')
    session = django_filters.NumberFilter(method='filter_session')

    class Meta:
        model = Chat
        fields = ['sender']

    def filter_group(self, queryset, name, value):
        ct = ContentType.objects.get_for_model(StudyGroup)
        return queryset.filter(content_type=ct, object_id=value)

    def filter_session(self, queryset, name, value):
        ct = ContentType.objects.get_for_model(Session)
        return queryset.filter(content_type=ct, object_id=value)