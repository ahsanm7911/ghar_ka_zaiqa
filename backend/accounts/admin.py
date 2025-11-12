from django.contrib import admin
from .models import Customer, Chef, CustomUser, ChatMessage, Notification, Review, Order, Bid, Wallet, Transaction
# Register your models here.
admin.site.register((CustomUser, Customer, Chef, Order, Bid, ChatMessage, Notification, Review))

@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ('user', 'balance')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ("wallet", "transaction_type", "amount", "created_at")
    list_filter = ("transaction_type", )