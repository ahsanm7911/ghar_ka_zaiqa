from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from django.db.models import Avg, Count
# Create your models here.

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('The Email field must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('user_type', 'admin')  # Set user_type to 'admin' for superusers
        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        return self.create_user(email, password, **extra_fields)
    
class CustomUser(AbstractBaseUser, PermissionsMixin):
    USER_TYPE_CHOICES = (
        ('customer', 'Customer'),
        ('chef', 'Chef'),
        ('admin', 'Admin'),  # Added 'admin' to choices
    )

    email = models.EmailField(_('email address'), unique=True)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    profile_image = models.ImageField(upload_to='profiles/', null=True, blank=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # Removed user_type from REQUIRED_FIELDS

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return self.email
    
class Customer(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='customer_profile')
    full_name = models.CharField(max_length=255)
    address = models.TextField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    dietary_preferences = models.TextField(blank=True, null=True)  # e.g., vegetarian, allergies
    location_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    location_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    order_count = models.PositiveBigIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Customer'
        verbose_name_plural = 'Customers'

    def __str__(self):
        return f"Customer: {self.full_name}"
    
class Chef(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='chef_profile')
    full_name = models.CharField(max_length=255)
    bio = models.TextField(blank=True, null=True)
    specialty = models.CharField(max_length=255, blank=True, null=True)  # e.g., Italian, Vegan
    years_of_experience = models.PositiveIntegerField(default=0)
    certification = models.CharField(max_length=255, blank=True, null=True)  # e.g., culinary degrees
    total_orders = models.PositiveIntegerField(default=0)
    delivery_radius_km = models.PositiveIntegerField(default=10)
    created_at = models.DateTimeField(auto_now_add=True)

    @property 
    def orders_count(self):
        return self.accepted_orders.all().count()

    @property
    def rating(self):
        return round(self.reviews.aggregate(Avg("rating"))["rating__avg"] or 0, 1)


    class Meta:
        verbose_name = 'Chef'
        verbose_name_plural = 'Chefs'
        
    def __str__(self):
        return f"Chef: {self.full_name}"
    

class Order(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('accepted', 'Accepted'),
        ('preparing', 'Preparing'),
        ('delivered', 'Delivered'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    FOOD_CATEGORIES = [
        ('grain',     'Grain'),
        ('meat',      'Meat'),
        ('seafood',   'Seafood'),
        ('vegetable', 'Vegetable'),
        ('fruit',     'Fruit'),
        ('dairy',     'Dairy'),
        ('legume',    'Legume'),
        ('nut_seed',  'Nuts & Seeds'),
        ('egg',       'Egg'),
        ('oil_fat',   'Oils & Fats')
    ]
    
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='orders')
    title = models.CharField(max_length=200)
    description = models.TextField()
    # category = models.CharField(choices=FOOD_CATEGORIES, default='n/a')
    max_budget = models.DecimalField(max_digits=8, decimal_places=2)
    delivery_address = models.TextField()
    preferred_delivery_time = models.DateTimeField()
    accepted_chef = models.ForeignKey(
        Chef, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='accepted_orders')
    image = models.ImageField(upload_to='orders/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'
        

    def __str__(self):
        return f"{self.title} - {self.description[:100]}"
    
class Wallet(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="wallet")
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.user.email} - Balance: {self.balance:.2f}"

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('credit', 'Credit'),
        ('debit', 'Debit'),
        ('commission', 'Commission'),
    ]
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name="transactions")
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_type} - {self.amount} ({self.wallet.user.email})"

    
class Bid(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('withdrawn', 'Withdrawn'),
    ]

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='bids')
    chef = models.ForeignKey(Chef, on_delete=models.CASCADE, related_name='bids')
    proposed_price = models.DecimalField(max_digits=8, decimal_places=2)
    delivery_estimate = models.DurationField(help_text="Estimated delivery time (e.g, 2 hours)")
    message = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.chef.full_name} (id: {self.chef.id}) placed bid on {self.order.title} (id: {self.order.id})"

    class Meta:
        unique_together = ('order', 'chef') # A chef can bid once per order


class ChatMessage(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='chats')
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='received_messages')
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)



class Review(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='review')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    chef = models.ForeignKey(Chef, on_delete=models.CASCADE, related_name='reviews')
    rating = models.FloatField(default=0.0, 
                               validators=[MinValueValidator(0.0), MaxValueValidator(5.0)], 
                               help_text="Average rating from 0.0 to 5.0")
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Review'
        verbose_name_plural = 'Reviews'

    def __str__(self):
        return f"Review for {self.chef.full_name} ({self.rating})"

class Notification(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='notifications')
    message = models.CharField(max_length=255)
    type = models.CharField(max_length=50, blank=True, null=True)  # e.g. "bid", "chat", "order"
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
