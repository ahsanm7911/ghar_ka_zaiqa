from rest_framework import serializers
from accounts.models import Customer, Chef, Order, Bid, ChatMessage, Review, Notification


class OrderSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.full_name", read_only=True)
    total_bids = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = '__all__'

    def get_total_bids(self, obj):
        return Bid.objects.filter(order=obj).count()


class BidSerializer(serializers.ModelSerializer):
    chef_name = serializers.CharField(source="chef.full_name", read_only=True)

    class Meta:
        model = Bid
        fields = '__all__'


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.email", read_only=True)

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


    
