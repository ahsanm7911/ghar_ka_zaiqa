from django.contrib import admin
from .models import Customer, Chef, CustomUser, ChatMessage, Notification
# Register your models here.
admin.site.register((CustomUser, Customer, Chef, ChatMessage, Notification))