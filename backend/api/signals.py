from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db.models.signals import post_save
from django.dispatch import receiver
from accounts.models import Order, Bid, Review, Wallet
from .serializers import OrderSerializer, BidSerializer, ReviewSerializer
from django.contrib.auth import get_user_model

channel_layer = get_channel_layer()
User = get_user_model()

@receiver(post_save, sender=Order)
def order_updated(sender, instance, created, **kwargs):
    """
    Fires when an order is created or updated.
    Sends distinct event types for better frontend handling.
    """
    data = OrderSerializer(instance).data

    if created:
        event_type = "order_created"
    elif instance.status == "accepted":
        event_type = "order_accepted"
    elif instance.status == "preparing":
        event_type = "order_preparing"
    elif instance.status == 'delivered':
        event_type = "order_delivered"
    elif instance.status == "completed":
        event_type = "order_completed"
    else:
        event_type = "order_updated"

    print(f"📢 {event_type} signal fired for order {instance.id}")

    async_to_sync(channel_layer.group_send)(
        "orders",
        {
            "type": "order.update",  # consumer method
            "event": event_type,
            "data": data,
        },
    )

@receiver(post_save, sender=Bid)
def bid_placed_signal(sender, instance, created, **kwargs):
    """
    Fires when a new bid is created.
    Broadcasts a WebSocket message so customers
    can instantly see new bids on their orders.
    """
    if created:
        print(f"📢 New bid placed by {instance.chef} on order {instance.order.id}")
        channel_layer = get_channel_layer()
        data = BidSerializer(instance).data

        async_to_sync(channel_layer.group_send)(
            "orders",  # same group as for other order/bid updates
            {
                "type": "bid.placed",  # this will map to bid_placed() in consumer
                "data": data,
            },
        )

@receiver(post_save, sender=Bid)
def bid_status_updated(sender, instance, created, **kwargs):
    """
    Fires whenever a bid is updated (e.g., accepted, declined, withdrawn).
    Broadcasts to the 'orders' WebSocket group so both chef and customer
    see live updates.
    """
    if not created and instance.status == 'accepted':

        channel_layer = get_channel_layer()
        chef_id = instance.chef.user.id # target this chef only 

        data = {
            "order": instance.order.id,
            "chef": chef_id, 
            "message": f"Your bid on order '{instance.order.title}' was accepted!"
        }

        print(f"📢 Sending bid accepted notification to user_{chef_id}")

        async_to_sync(channel_layer.group_send)(
            f"user_{chef_id}",
            {
                "type": "bid.accepted",  # consumer method name => bid_accepted
                "data": data,
            },
        )

@receiver(post_save, sender=Review)
def review_updated(sender, instance, created, **kwargs):
    """
    Fires when a review is updated.
    Broadcasts to the relevant chef. 
    """
    data = ReviewSerializer(instance).data

    event_type = "review_created" if created else "review_updated"

    async_to_sync(channel_layer.group_send)(
        "orders", 
        {
            "type": "order.update", 
            "event": event_type,
            "data": data
        }
    )

    print(f"Signal fired: {event_type} for Review ID {instance.id}")


@receiver(post_save, sender=User)
def create_wallet_for_user(sender, instance, created, **kwargs):
    if created and not hasattr(instance, "wallet"):
        Wallet.objects.create(user=instance)