from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.utils import timezone
from study.services import MembershipService
from core.exceptions import ServiceError
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
import urllib.parse
from django.contrib.contenttypes.models import ContentType
from .models import Chat
class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.group_id = self.scope['url_route']['kwargs'].get('group_id')
        self.session_id = self.scope['url_route']['kwargs'].get('session_id')
        self.user = await self.get_user_from_scope()
        await self.accept()

        if self.user is None:
            await self.send_json({
                "type": "error",
                "code": "unauthorized",
                "detail": "Authentication required."
            })
            await self.close()
            return

        if self.session_id and not self.group_id:
            self.session_group = await self.get_session_group_id(self.session_id)
            if self.session_group is None:
                await self.send_json({
                    "type": "error",
                    "code": "not_found",
                    "detail": "Session not found."
                })
                await self.close()
                return

        try:
            group_filter = self.session_group.group.id if self.session_id and not self.group_id else self.group_id
            self.group, self.user = await database_sync_to_async(
                MembershipService._get_group_and_user
            )(group_id=group_filter, user_id=self.user.id)
        except Exception as e:
            await self._send_error(e)
            await self.close()
            return

        try:
            await database_sync_to_async(
                MembershipService.require_active_membership
            )(group=self.group, user=self.user)
        except Exception as e:
            await self._send_error(e)
            await self.close()
            return

        if self.group_id and not self.session_id:
            self.group_name = f"study_group_{self.group_id}_chat"
        elif self.session_id and not self.group_id:
            self.group_name = f"session_{self.session_id}_chat"
        else:
            await self._send_error(
                {"type": "error", "code": "VALIDATION_ERROR", "detail": "Problem on channel group name creation."}
            )
            await self.close()
            return

        await self.channel_layer.group_add(self.group_name, self.channel_name)

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name') and self.group_name:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        try:
            event_type = content.get("type")
            if event_type == 'message.send':
                message_content = content.get("message", "").strip()
                # attachments: expected as a comma-separated string of URLs or a single URL string
                # e.g. "https://cdn.example.com/file1.png,https://cdn.example.com/file2.pdf"
                attachments = content.get("attachments", "") or None
                reply_to_id = content.get("reply_to")
                reply_to_id = int(reply_to_id) if reply_to_id else None

                # reject if neither message text nor attachments are provided
                if not message_content:
                    return

                connect_id = self.session_id if self.session_id and not self.group_id else self.group_id

                message_data = {
                    "message": message_content or None,
                    "attachments": attachments,
                    "sender": self.user,
                    "reply_to_id": reply_to_id,
                    "object_id": connect_id,
                    "content_type_model": "studygroup" if self.group_id else "session",
                }


                message = await self.create_chat_instance(**message_data)

                payload = {
                    "type": "message.broadcast",
                    **message,
                }
                await self.channel_layer.group_send(self.group_name, payload)

        except Exception as e:
            await self.send_json({"error": str(e)})

    async def message_broadcast(self, event):
        event["type"] = "message"
        await self.send_json(event)

    async def _send_error(self, e: Exception):
        print(e)
        await self.send_json({
            "type": "error",
            "code": str(e),
            "detail": str(e),
        })

    # ── DB HELPERS ────────────────────────────────────────────────────────────

    @database_sync_to_async
    def get_user_from_scope(self):
        user = self.scope.get("user")

        if user and user.is_authenticated:
            return user

        query_string = self.scope.get("query_string", b"").decode()
        qs = urllib.parse.parse_qs(query_string)
        token_list = qs.get("token") or qs.get("access_token")

        if not token_list:
            return None

        try:
            jwt_auth = JWTAuthentication()
            validated_token = jwt_auth.get_validated_token(token_list[0])
            return jwt_auth.get_user(validated_token)
        except (InvalidToken, TokenError):
            return None

    @database_sync_to_async
    def create_chat_instance(self, **kwargs):

        ct = ContentType.objects.get(app_label="study", model=kwargs["content_type_model"])
        msg = Chat.objects.create(
            message=kwargs.get("message"),
            attachments=kwargs.get("attachments"),
            sender=kwargs["sender"],
            reply_to_id=kwargs.get("reply_to_id"),
            content_type=ct,
            object_id=kwargs["object_id"],
        )


        # re-fetch with relations for serialization
        msg = Chat.objects.select_related(
            "sender",
            "reply_to",
            "reply_to__sender",
        ).get(id=msg.id)

        return self._serialize_message(msg)

    @staticmethod
    def _serialize_message(msg) -> dict:
        """Serialize a Chat instance into a broadcast-ready dict."""
        return {
            "id": msg.id,
            "message": msg.message,
            "attachments": msg.attachments,          # raw text — client parses/splits as needed
            "created_at": msg.created_at.isoformat(),
            "sender": {
                "id": msg.sender.id,
                "first_name": msg.sender.first_name,
                "last_name": msg.sender.last_name,
                "email": msg.sender.email,
                "avatar": msg.sender.avatar,
            },
            "reply_to": {
                "id": msg.reply_to.id,
                "message": msg.reply_to.message,
                "attachments": msg.reply_to.attachments,
                "sender": {
                    "id": msg.reply_to.sender.id,
                    "first_name": msg.reply_to.sender.first_name,
                    "last_name": msg.reply_to.sender.last_name,
                    "avatar": msg.reply_to.sender.avatar,
                },
            } if msg.reply_to else None,
        }

    @database_sync_to_async
    def get_session_group_id(self, session_id):
        from django.apps import apps
        Session = apps.get_model("study", "Session")
        return Session.objects.select_related("group").filter(id=session_id).first()