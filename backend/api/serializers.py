from rest_framework import serializers
from accounts.models import Customer, Chef, Order, Bid, ChatMessage, Review, Notification


class OrderSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.user.full_name", read_only=True)

    class Meta:
        model = Order
        fields = '__all__'


class BidSerializer(serializers.ModelSerializer):
    chef_name = serializers.CharField(source="chef.user.full_name", read_only=True)

    class Meta:
        model = Bid
        fields = '__all__'


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.full_name", read_only=True)

    class Meta:
        model = ChatMessage
        fields = '__all__'


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'


    
