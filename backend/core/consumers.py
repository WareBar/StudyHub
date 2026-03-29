import json
from channels.generic.websocket import AsyncWebsocketConsumer

class VideoConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        """
        Called when a user connects to WebSocket.
        Adds them to a room group.
        """
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f"video_{self.room_name}"

        # Add user to room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        """
        Called when user disconnects.
        Removes them from the room.
        """
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        """
        Receives message from frontend
        Broadcasts it to everyone in the room
        """
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "room_message",
                "message": text_data
            }
        )

    async def room_message(self, event):
        """
        Sends broadcasted message back to clients
        """
        await self.send(text_data=event["message"])
