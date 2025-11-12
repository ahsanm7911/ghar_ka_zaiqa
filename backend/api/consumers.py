import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer, AsyncWebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from asgiref.sync import sync_to_async
from accounts.models import CustomUser, ChatMessage, Order


class OrderConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        user = self.scope['user']
        print("User ob: ", user)
        if user.is_authenticated:
            # Join a global orders group
            await self.channel_layer.group_add("orders", self.channel_name)

            # Join a personal group 
            await self.channel_layer.group_add(f"user_{user.id}", self.channel_name)

            await self.accept()
            print(f"Websocket connected for user {user.id}")
        else:
            # Reject unauthenticated socket
            await self.close()

        

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("orders", self.channel_name)

    async def receive_json(self, content):
        # optional - if client sends something 
        pass

    async def order_update(self, event):
        await self.send_json({
            "event": event.get("event", "order_update"), 
            "data": event["data"]
        })

    async def bid_placed(self, event):
        """When a chef places a new bid."""
        print("📨 Bid placed event:", event["data"])
        await self.send_json({
            "event": "bid_placed",
            "data": event["data"],
        })

    async def bid_accepted(self, event):
        """
        Handle accepted bid notifications.
        """
        print("Bid accepted event received:", event["data"])
        await self.send_json({
            "event": "bid_accepted",
            "data": event["data"]
        })

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.order_id = self.scope['url_route']['kwargs']['order_id']
        self.room_group_name = f"chat_{self.order_id}"

        # Join chat room
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        sender_id = data['sender']
        receiver_id = data['receiver']

        # Save message to DB
        await self.save_message(sender_id, receiver_id, self.order_id, message)

        # Broadcast message
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender': sender_id,
                'receiver': receiver_id
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender': event['sender'],
            'receiver': event['receiver']
        }))

    @sync_to_async
    def save_message(self, sender_id, receiver_id, order_id, message):
        sender = CustomUser.objects.get(id=sender_id)
        receiver = CustomUser.objects.get(id=receiver_id)
        order = Order.objects.get(id=order_id)
        ChatMessage.objects.create(
            sender=sender,
            receiver=receiver,
            order=order,
            message=message
        )

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.group_name = f"user_{self.user_id}"

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        # optional: handle client messages (mark as read, etc.)
        pass

    async def send_notification(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'type': event.get('type', 'info')
        }))
