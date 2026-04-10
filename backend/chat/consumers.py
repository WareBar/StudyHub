from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.utils import timezone
from study.models import MemberShip

# FLOW
"""

CONNECTS TO WEBSOCKET
LISTEN TO CONNECTION
CLIENT SENDS MESSAGE WITH TYPE message.send
CONSUMER HANDLES THE MESSAGE
CHECKS THE THE TYPE AND CONTENT
SAVES THE MESSAGE TO THE DATABASE FOR PERSISTENCE
BROADCAST IT TO GROUP MEMBERS
"""

class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        # connects to the room using group_id
        self.group_id = self.scope['url_route']['kwargs']['group_id']
        # create group for the channel
        self.group_name =  f"group_{self.group_id}"

        # authenticate user(user attempting to connect to the group chat room) and check if he is a member of the group 
        user = await self.get_user_from_scope()
        if user is None or not user.is_active:
            await self.close(code=4001)
            return 
        is_member = MemberShip.objects.filter(group_id=self.group_id, user=user).exist()

        if not is_member:
            await self.close(code=4001)
            return
        
        self.user = user

        # adding the group name into channel layer
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)


    # handles the messages recieve from the client or handles the messages being sent
    
    async def receive_json(self, content, **kwargs):
        try:
            chat_type = content.get('type')
            if chat_type == 'message.send':
                message = content.get('message',"").strip()
                message_type = content.get('chat_type', "").strip()
                reply_to_id = content.get("reply_to")
                reply_to_id = int(reply_to_id) if reply_to_id else None

                # if message is black
                if not message:
                    return

                # chat_instance = await self.


        except Exception as e:
            await self.send_json({"error": str(e)})


    # handles events sent to the grou

    # broadcast the newly sent message to the group
    async def message_message(self, event):
        # forward to clients
        event["type"] =  "message"
        await self.send_json(event)


    # DB HELPERS ---------------------------------------------------------------------------------------
    # we need it since we are on asyncrounous operation
    @database_sync_to_async
    def create_chat(self, group_id, user, message, message_type, reply_to_id):
        from django.apps import apps
        Chat = apps.get_model('Chat','Chat')


        chat = Chat.objects.create(
            chat_type=message_type,
            message=message,
            group_id=group_id,
            sender=user,
            reply_to_id=reply_to_id,
        )

        chat = Chat.objects.select_related(
            "sender",
            "reply_to",
            "reply_to__sender"
        ).get(pk=chat.id)

        return {
            "id": chat.id,
            "message": chat.message,
            "message_type":chat.message_type,
            "created_at": chat.created_at.isoformat(),
            "sender": {
                "id": chat.sender.id,
                "first_name": chat.sender.first_name,
                "last_name": chat.sender.last_name,
                "email": chat.sender.email,
                "avatar": chat.sender.avatar,
            },
            "reply_to": {
                "id": chat.reply_to.id,
                "content": chat.reply_to.message,
                "content_type":chat.message_type,
                "sender": {
                    "id": chat.reply_to.sender.id,
                    "first_name": chat.reply_to.sender.first_name,
                    "last_name": chat.reply_to.sender.last_name,
                    "avatar": chat.reply_to.sender.avatar,
                }
            } if chat.reply_to else None
        }

    # get the user from the scope from the jwt
    @database_sync_to_async
    def get_user_from_scope(self):
        """
        Default: attempt to use scope["user"] (AuthMiddlewareStack) which supports session auth.
        Additionally: support token via querystring ?token=JWT... (common pattern)
        Modify this for your auth (SimpleJWT, DRF token, etc).
        """
        # If already authenticated via session:
        if getattr(self.scope, "user", None) and self.scope["user"].is_authenticated:
            return self.scope["user"]

        # Fallback: try token in query string
        query_string = self.scope.get("query_string", b"").decode()
        
        # parse token param
        import urllib.parse
        qs = urllib.parse.parse_qs(query_string)
        token_list = qs.get("token") or qs.get("access_token")
        if not token_list:
            return None
        token = token_list[0]

        # Example for SimpleJWT:

        from rest_framework_simplejwt.authentication import JWTAuthentication
        jwt_auth = JWTAuthentication()
        validated_token = jwt_auth.get_validated_token(token)
        user = jwt_auth.get_user(validated_token)
        return user