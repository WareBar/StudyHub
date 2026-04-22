from User.models import User
from rest_framework.serializers import ModelSerializer

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"
        extra_kwargs = {
            "password":{"write_only":True}
        }


class SimpleUserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ["id","username", "first_name","last_name","email", "avatar"]