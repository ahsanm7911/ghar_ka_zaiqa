from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .serializers import (
    OrderSerializer, BidSerializer, ChatMessageSerializer,
    ReviewSerializer, NotificationSerializer
)
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from accounts.models import Customer, Chef, Order, Bid, ChatMessage, Review, Notification
from .permissions import IsCustomer, IsChef


@api_view(['POST'])
@permission_classes([IsCustomer])
def create_order(request):
    customer = Customer.objects.get(user=request.user)
    data = dict(request.data)
    data['customer'] = customer.id
    serializer = OrderSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsCustomer])
def customer_orders(request):
    customer = Customer.objects.get(user=request.user)
    orders = Order.objects.filter(customer=customer)
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsChef])
def open_orders(request):
    orders = Order.objects.filter(status='open')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsChef])
def place_bid(request, order_id):
    chef = Chef.objects.get(user=request.user)
    order = get_object_or_404(Order, id=order_id)
    data = request.data
    data['order'] = order.id
    data['chef'] = chef.id
    serializer = BidSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        order.status = 'bidding'
        order.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsCustomer])
def order_bids(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    if order.customer.user != request.user:
        return Response({'error': 'Not authorized'}, status=403)
    bids = order.bids.all()
    serializer = BidSerializer(bids, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsCustomer])
def accept_bid(request, bid_id):
    bid = get_object_or_404(Bid, id=bid_id)
    order = bid.order
    if order.customer.user != request.user:
        return Response({'error': 'Not authorized'}, status=403)

    bid.status = 'accepted'
    bid.save()
    order.status = 'accepted'
    order.save()
    Bid.objects.filter(order=order).exclude(id=bid.id).update(status='declined')

    # Notify chef (real-time)
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"user_{bid.chef.user.id}",
        {
            "type": "send_notification",
            "message": f"🎉 Your bid for order '{order.title}' was accepted!",
            "notification_type": "bid_update"
        }
    )

    return Response({'message': 'Bid accepted successfully!'})

@api_view(['POST'])
def send_message(request):
    data = request.data
    serializer = ChatMessageSerializer(data=data)
    if serializer.is_valid():
        serializer.save(sender=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_chat_messages(request, order_id):
    messages = ChatMessage.objects.filter(order_id=order_id).order_by('timestamp')
    serializer = ChatMessageSerializer(messages, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsCustomer])
def add_review(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    customer = Customer.objects.get(user=request.user)
    if order.customer != customer:
        return Response({'error': 'Not authorized'}, status=403)
    data = request.data
    data['order'] = order.id
    data['customer'] = customer.id
    data['chef'] = order.bids.filter(status='accepted').first().chef.id
    serializer = ReviewSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_notifications(request):
    notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)
