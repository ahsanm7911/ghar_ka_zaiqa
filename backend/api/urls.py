from django.urls import path
from . import views

urlpatterns = [
    # Orders
    path('orders/', views.orders),
    path('orders/create/', views.create_order),
    path('orders/my/', views.customer_orders),
    path('orders/open/', views.open_orders),
    path('orders/<int:pk>/', views.order_detail),

    # Bids
    path('orders/<int:order_id>/bids/', views.order_bids),
    path('orders/<int:order_id>/bid/', views.place_bid),
    path('bids/<int:bid_id>/accept/', views.accept_bid),
    path('bids/my-bids/', views.chef_bids),

    # Chat
    path('chat/', views.list_user_chats),
    path('chat/send/', views.send_message),
    path('chat/<int:order_id>/', views.get_chat_messages),

    # Review
    path('orders/<int:order_id>/review/', views.add_review),

    # Notifications
    path('notifications/', views.get_notifications),
]
