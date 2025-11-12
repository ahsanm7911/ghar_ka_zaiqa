from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .serializers import (
    OrderSerializer, BidSerializer, ChatMessageSerializer,
    ReviewSerializer, NotificationSerializer, TransactionSerializer
)
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from accounts.models import Customer, Chef, Order, Bid, ChatMessage, Review, Notification, Wallet, Transaction
from .permissions import IsCustomer, IsChef, IsAmdin
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q, Avg, Count, F, Sum
from django.utils import timezone
from django.db import models
from datetime import timedelta
from pprint import pprint
from .utils import credit_chef_wallet


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


@api_view(['GET'])
@permission_classes([IsChef])
def orders(request): # Get all orders
    orders = Order.objects.all()
    serializer = OrderSerializer(orders, many=True)
    pprint(serializer.data)
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

    order.accepted_chef = bid.chef
    order.status = 'accepted'
    order.save()

    # # Notify chef (real-time)
    # channel_layer = get_channel_layer()
    # async_to_sync(channel_layer.group_send)(
    #     f"user_{bid.chef.user.id}",
    #     {
    #         "type": "send_notification",
    #         "message": f"🎉 Your bid for order '{order.title}' was accepted!",
    #         "notification_type": "bid_update"
    #     }
    # )

    return Response({
        'message': 'Bid accepted successfully!',
        'order_id': order.id, 
        'order_status': order.status, 
        'accepted_bid_id': bid.id, 
        'chef_id': bid.chef.id
        }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsChef])
def fulfill_order(request, order_id):
    """
    Allows a chef to mark an order as delivered once it's prepared.
    """
    try:
        chef = Chef.objects.get(user=request.user)
    except Chef.DoesNotExist:
        return Response({'detail': 'Chef profile not found.'}, status=status.HTTP_400_BAD_REQUEST)

    order = get_object_or_404(Order, id=order_id)

    # Ensure this chef is the accepted chef
    if order.accepted_chef != chef:
        return Response({'detail': 'You are not authorized to fulfill this order.'},
                        status=status.HTTP_403_FORBIDDEN)

    # Update the order status
    order.status = 'delivered'
    order.save()

    # Optionally notify the customer via WebSocket signal
    """
    from asgiref.sync import async_to_sync
    from channels.layers import get_channel_layer
    from .serializers import OrderSerializer

    channel_layer = get_channel_layer()
    data = OrderSerializer(order).data
    async_to_sync(channel_layer.group_send)(
        "orders",
        {"type": "order.update", "data": data}
    )
    """

    return Response({"message": "Order marked as delivered successfully!"}, status=status.HTTP_200_OK)



@api_view(['POST'])
@permission_classes([IsCustomer])
def mark_order_complete(request, order_id):
    try:
        order = Order.objects.get(id=order_id, customer__user=request.user)
    except Order.DoesNotExist:
        return Response({'detail': 'Order not found or unauthorized.'}, status=status.HTTP_404_NOT_FOUND)
    
    # Verify the order has an accepted bid.
    accepted_bid = Bid.objects.filter(order=order, status='accepted').first()
    if not accepted_bid:
        return Response({'detail': 'No accepted bid found for this order.'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Mark as completed 
    order.status = 'completed'
    order.save()

    # Credit chef and admin wallets 
    result = credit_chef_wallet(accepted_bid.chef.user, accepted_bid.proposed_price, order.id)

    # Create or update review placeholder 
    review, created = Review.objects.get_or_create(
        order=order, 
        customer=order.customer, 
        chef=accepted_bid.chef
    )

    serializer = ReviewSerializer(review)
    return Response({
        'message': 'Order marked as completed and funds transferred successfully. You can now rate the chef.',
        'chef_earnings': result["chef_earnings"],
        'commission': result["commission"],
        'review': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_wallet_details(request):
    try:
        wallet = Wallet.objects.get(user=request.user)
        transactions = wallet.transactions.all().order_by('-created_at')

        data = {
            "balance": wallet.balance,
            "transactions": TransactionSerializer(transactions, many=True).data
        }
        return Response(data)
    except Wallet.DoesNotExist:
        return Response({"error": "Wallet not found"}, status=404)

@api_view(['GET'])
@permission_classes([AllowAny])
def top_chefs(request):
    # Aggregate chef stats
    chefs = Chef.objects.annotate(
        avg_rating=Avg('reviews__rating'),
        completed_orders=Count(
            'accepted_orders',
            filter=Q(bids__order__status='completed'),
            distinct=True
        ),
        total_bids=Count('bids', distinct=True),
    ).annotate(
        success_rate=F('completed_orders') * 100.0 / F('total_bids')
    ).order_by('-avg_rating', '-success_rate', '-completed_orders')[:20]

    data = []
    for chef in chefs:
        data.append({
            "id": chef.id,
            "name": chef.full_name,
            "specialty": chef.specialty,
            "bio": chef.bio,
            "rating": round(chef.avg_rating or 0, 1),
            "success_rate": round(chef.success_rate or 0, 1),
            "completed_orders": chef.completed_orders,
            "total_reviews": chef.reviews.all().count(),
            "total_bids": chef.bids.all().count()
        })
    print(f"Top chefs data: {data}")
    return Response(data)

@api_view(["GET"])
@permission_classes([AllowAny])
def chef_profile(request, chef_id):
    chef = get_object_or_404(Chef, id=chef_id)
    reviews = Review.objects.filter(chef=chef).select_related("customer").order_by("-created_at")

    data = {
        "id": chef.id,
        "name": chef.full_name,
        "bio": chef.bio,
        "specialty": chef.specialty,
        "rating": round(chef.reviews.aggregate(Avg("rating"))["rating__avg"] or 0, 1),
        "completed_orders": chef.accepted_orders.all().count(),
        "reviews": [
            {
                "id": r.id,
                "customer": r.customer.full_name,
                "rating": r.rating,
                "comment": r.comment,
                "created_at": r.created_at,
            }
            for r in reviews
        ],
    }
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chef_stats(request):
    chef = Chef.objects.get(user=request.user)
    today = timezone.now().date()

    total_bids_today = Bid.objects.filter(chef=chef, created_at__date=today).count()
    total_orders_completed_today = Order.objects.filter(
        accepted_chef=chef, status='completed', updated_at__date=today
    ).distinct().count()

    total_earnings_today = Transaction.objects.filter(
        wallet__user=request.user,
        transaction_type='credit',
        created_at__date=today
    ).aggregate(total=models.Sum('amount'))['total'] or 0

    total_bids_all_time = Bid.objects.filter(chef=chef).count()
    total_completed_orders = Order.objects.filter(accepted_chef=chef, status='completed').distinct().count()
    success_rate = round((total_completed_orders / total_bids_all_time) * 100, 2) if total_bids_all_time else 0

    wallet = Wallet.objects.filter(user=request.user).first()

    data = {
        "balance": wallet.balance if wallet else 0,
        "today": {
            "bids": total_bids_today,
            "completed_orders": total_orders_completed_today,
            "earnings": total_earnings_today
        },
        "overall": {
            "total_bids": total_bids_all_time,
            "completed_orders": total_completed_orders,
            "success_rate": success_rate
        }
    }
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard(request):
    total_commission = (
        Transaction.objects.filter(transaction_type='commission')
        .aggregate(total=Sum('amount'))['total'] or 0
    )
    total_transactions = Transaction.objects.filter(transaction_type='commission').count()
    latest_commissions = (
        Transaction.objects.filter(transaction_type='commission')
        .order_by('-created_at')[:10]
    )

    data = {
        "total_commission": round(total_commission, 2) or 0,
        "total_transactions": total_transactions,
        "recent": [
            {
                "chef": t.description,
                "amount": t.amount,
                "created_at": t.created_at,
            }
            for t in latest_commissions
        ],
    }
    print(f"Data: {data}")
    return Response(data)

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
def submit_review(request, order_id):
    print("Data received in review request: ", request.data)
    try:
        review = Review.objects.get(order__id=order_id, customer__user=request.user)
    except Review.DoesNotExist:
        return Response({'detail': 'Review not found.'},
                        status=status.HTTP_404_NOT_FOUND)

    serializer = ReviewSerializer(review, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Review submitted successfully.'},
                        status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_notifications(request):
    notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)
