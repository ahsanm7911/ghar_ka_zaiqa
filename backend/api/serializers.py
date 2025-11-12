from rest_framework import serializers
from accounts.models import Customer, Chef, Order, Bid, ChatMessage, Review, Notification, Transaction


class ReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.full_name", read_only=True)
    accepted_chef = serializers.CharField(source="chef.user.id")

    class Meta:
        model = Review
        fields = ['id', 'order', 'customer', 'rating', 'comment', 'created_at', 'updated_at', 'accepted_chef', 'customer_name']
        
class OrderSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.full_name", read_only=True)
    total_bids = serializers.SerializerMethodField()
    accepted_chef = serializers.CharField(source="accepted_chef.user.id", read_only=True)
    accepted_chef_name = serializers.CharField(source="accepted_chef.full_name", read_only=True)
    review = ReviewSerializer(read_only=True)

    class Meta:
        model = Order
        fields = '__all__'

    def get_total_bids(self, obj):
        return Bid.objects.filter(order=obj).count()


class BidSerializer(serializers.ModelSerializer):
    chef_name = serializers.CharField(source="chef.full_name", read_only=True)
    chef_rating = serializers.FloatField(source="chef.rating", read_only=True)
    chef_order_count = serializers.IntegerField(source="chef.orders_count", read_only=True)

    class Meta:
        model = Bid
        fields = '__all__'


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.email", read_only=True)

    class Meta:
        model = ChatMessage
        fields = '__all__'




class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'transaction_type', 'amount', 'description', 'created_at']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'


    
