from django.urls import path
from . import views

urlpatterns = [
    # Admin
    path('admin-dashboard/', views.admin_dashboard, name='admin-dashboard'),


    # Chefs 
    path("chefs/top/", views.top_chefs, name="top-chefs"),
    path("chefs/<int:chef_id>/", views.chef_profile, name="chef-profile"),
    path("chef/stats/", views.chef_stats, name="chef-stats"),

    # Orders
    path('orders/', views.orders),
    path('orders/create/', views.create_order),
    path('orders/my/', views.customer_orders),
    path('orders/open/', views.open_orders),
    path('orders/<int:pk>/', views.order_detail),
    path('orders/<int:order_id>/fulfill/', views.fulfill_order),
    path('orders/<int:order_id>/complete/', views.mark_order_complete),

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
    path('orders/<int:order_id>/review/', views.submit_review),

    # Wallet 
    path("wallet/", views.get_wallet_details),

    # Notifications
    path('notifications/', views.get_notifications),
]
