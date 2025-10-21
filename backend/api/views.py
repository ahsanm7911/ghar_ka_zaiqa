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
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q


@api_view(['POST'])
@permission_classes([IsCustomer])
def create_order(request):
    print(f"Request data: {request.data}")
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
    print(f"Customer orders: {serializer.data}")
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsChef])
def open_orders(request):
    orders = Order.objects.filter(status='open')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsChef])
def orders(request): # Get all orders
    orders = Order.objects.all()
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_detail(request, pk): # Get order details
    order = Order.objects.get(id=pk)
    serializer = OrderSerializer(order)
    return Response(serializer.data)



@api_view(['GET'])
@permission_classes([IsChef])
def chef_bids(request):
    chef = Chef.objects.get(user=request.user)
    bids = Bid.objects.filter(chef=chef)
    serializer = BidSerializer(bids, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsChef])
def place_bid(request, order_id):
    """
    Allows a chef to place a bid on an open order.
    Multiple chefs can bid on the same order.
    """
    try:
        chef = Chef.objects.get(user=request.user)
    except Chef.DoesNotExist:
        return Response({'detail': 'Chef profile not found.'}, status=status.HTTP_400_BAD_REQUEST)
    
    order = get_object_or_404(Order, id=order_id)

    # Only allow bidding on open orders 
    if order.status != 'open':
        return Response({'detail': 'Bidding is closed for this order.'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Prepare data for serializer 
    data = request.data.copy()
    data['order'] = order.id
    data['chef'] = chef.id

    serializer = BidSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    print(f"Serializer errors: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsCustomer])
def order_bids(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    if order.customer.user != request.user:
        return Response({'error': 'Not authorized'}, status=403)
    bids = order.bids.all()
    serializer = BidSerializer(bids, many=True)
    print(f"Bid Serializer data: {serializer.data}")
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsCustomer])
def accept_bid(request, bid_id):
    bid = get_object_or_404(Bid, id=bid_id)
    order = bid.order

    # Only the order's customer can accept a bid
    if order.customer.user != request.user:
        return Response({'error': 'Not authorized to accept this bid.'}, status=status.HTTP_403_FORBIDDEN)
    
    # Only allow acceptance if order is open 
    if order.status != 'open':
        return Response({'detail': 'This order is no longer open for bidding.'}, status=status.HTTP_400_BAD_REQUEST)

    bid.status = 'accepted'
    bid.save()

    Bid.objects.filter(order=order).exclude(id=bid.id).update(status='declined')

    order.status = 'accepted'
    order.save()

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

    return Response({
        'message': 'Bid accepted successfully!',
        'order_id': order.id, 
        'order_status': order.status, 
        'accepted_bid_id': bid.id, 
        'chef_id': bid.chef.id
        }, status=status.HTTP_200_OK)

@api_view(['POST'])
def send_message(request):
    data = request.data
    serializer = ChatMessageSerializer(data=data)
    if serializer.is_valid():
        serializer.save(sender=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Chats 

# GET /chat/
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_user_chats(request):
    chats = ChatMessage.objects.filter(
        Q(sender=request.user)
    ).order_by('-timestamp')
    serializer = ChatMessageSerializer(chats, many=True, context={'request': request})
    print(f"Serializer data: {serializer.data}")
    return Response(serializer.data)


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
