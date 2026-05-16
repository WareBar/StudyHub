from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
import urllib.parse

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from study.services import MembershipService, SessionService
from core.exceptions import ServiceError

# in memory, when deplying, change approach to get, delete and set
connected_users: dict[str, set] = {}  # session_id -> set of user_ids

class VideoConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.session_id = self.scope['url_route']['kwargs']['session_id']
        self.group_id = self.scope['url_route']['kwargs']['group_id']
        self.user = await self.get_user_from_scope()
        print(f"DEBUG connect user: {self.user}")  # add this
        await self.accept()
        self.joined = False

        # guard immediately after getting user
        if self.user is None:
            await self.send_json({
                "type": "error",
                "code": "unauthorized",
                "detail": "Authentication required."
            })
            await self.close()
            return

        # get user and group instance
        try:
            self.group, self.user  = await database_sync_to_async(MembershipService._get_group_and_user)(group_id=self.group_id, user_id=self.user.id)
        except Exception as e:
            await self._send_error(e)
            await self.close()
            return



        # upon connectoin, check if the user is an accepted member
        try:
            await database_sync_to_async(MembershipService.require_active_membership)(group=self.group, user=self.user)
        except Exception as e:
            await self._send_error(e)
            await self.close()
            return
        

        session_users = connected_users.setdefault(self.session_id, set())
        if str(self.user.id) in session_users:
            await self.send_json({
                "type": "error",
                "code": "ALREADY_CONNECTED",
                "detail": "You are already connected from another device."
            })
            await self.close()
            return

        # then record the attendance
        try:
            await database_sync_to_async(SessionService.join)(session_id=self.session_id, user=self.user)
        except Exception as e:
            await self._send_error(e)
            await self.close()
            return
        
        # add to the video call
        session_users.add(str(self.user.id))  # ← mark as connected
        self.room_name = f"session_{self.session_id}_video_call"
        self.joined = True
        # then add to channel layer
        await self.channel_layer.group_add(
            self.room_name,
            self.channel_name
        )

        # send the current user their own info so frontend knows who "me" is
        await self.send_json({
            "type": "self-info",
            "user": {
                "id": str(self.user.id),
                "username": self.user.username,
                "email": self.user.email,
                "first_name": self.user.first_name,
                "last_name": self.user.last_name,
                "avatar": self.user.avatar if hasattr(self.user, "avatar") else None,
            }
        })


    # when user leaves, record they left
    async def disconnect(self, code):
        # self.room_name is only set after a successful join,
        # so skip cleanup if the user never fully connected
        if not getattr(self, 'joined', False):
            return
        
        # remove from connected users so they can rejoin later
        connected_users.get(self.session_id, set()).discard(str(self.user.id))

        try:
            await database_sync_to_async(SessionService.leave)(session_id=self.session_id, user=self.user)
        except Exception as e:
            print(f"Error leaving session: {e}")
        await self.channel_layer.group_discard(self.room_name, self.channel_name)


    # receive event from frontend then call event  function to broadcast events like user joining and leaving
    async def receive_json(self, content):
        msg_type = content.get("type")

        if msg_type == "user-connected":
            # broadcast the new peer's ID to everyone else in the room
            await self.channel_layer.group_send(self.room_name, {
                "type": "user_connected",
                "userId": content.get("userId"),
                "senderId": self.channel_name,
                "user": {
                    "id": str(self.user.id),
                    "username": self.user.username,
                    "email": self.user.email,
                    "first_name": self.user.first_name,
                    "last_name": self.user.last_name,
                    "avatar": self.user.avatar if hasattr(self.user, "avatar") else None,
                }
            })

        else:
            # generic broadcast for anything else
            await self.channel_layer.group_send(self.room_name, {
                "type": "room_event",
                "message": content
            })




    async def _send_error(self, e: Exception):
        await self.send_json({
            "type": "error",
            "code": e.detail.get("code"),
            "detail": e.detail.get("detail"),
        })

    # handler function
    async def room_event(self, event):
        await self.send_json(event["message"])

    # handler for user_connected group event
    async def user_connected(self, event):
        # don't echo back to the sender
        if event.get("senderId") == self.channel_name:
            return

        await self.send_json({
            "type": "user-connected",
            "userId": event["userId"],
            "user": event["user"],
        })





    # DB HELPERS -----------------------------------------------------------------------------------
    @database_sync_to_async
    def get_user_from_scope(self):
        user = self.scope.get("user")
        print(f"DEBUG scope user: {user}")
        print(f"DEBUG is authenticated: {user.is_authenticated if user else 'no user'}")
        
        if user and user.is_authenticated:
            return user

        query_string = self.scope.get("query_string", b"").decode()
        print(f"DEBUG query string: {query_string}")
        
        qs = urllib.parse.parse_qs(query_string)
        token_list = qs.get("token") or qs.get("access_token")
        if not token_list:
            print("DEBUG no token found in query string")
            return None

        try:
            jwt_auth = JWTAuthentication()
            validated_token = jwt_auth.get_validated_token(token_list[0])
            user = jwt_auth.get_user(validated_token)
            print(f"DEBUG JWT user: {user}")
            return user
        except (InvalidToken, TokenError) as e:
            print(f"DEBUG JWT auth failed: {e}")
            return None
        
