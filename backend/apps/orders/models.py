from django.db import models
import uuid
from django.db import models
from django.conf import settings
from apps.products.models import Product
from apps.coupons.models import Coupon
from apps.cart.models import Cart, CartItem
from rest_framework.permissions import IsAuthenticated, AllowAny  # ← ADD THIS
from django.conf import settings  # ← ADD THIS
# ── Order ─────────────────────────────────────────────────────
class Order(models.Model):
    STATUS_CHOICES = [
        ('pending',    'Pending'),
        ('confirmed',  'Confirmed'),
        ('processing', 'Processing'),
        ('shipped',    'Shipped'),
        ('delivered',  'Delivered'),
        ('cancelled',  'Cancelled'),
        ('refunded',   'Refunded'),
    ]
 
    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user         = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT,
                                     related_name='orders')
    address      = models.ForeignKey('users.Address', on_delete=models.PROTECT,
                                     related_name='orders')
    coupon       = models.ForeignKey(Coupon, on_delete=models.SET_NULL,
                                     null=True, blank=True, related_name='orders')
    subtotal     = models.DecimalField(max_digits=12, decimal_places=2)
    discount     = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    delivery_fee = models.DecimalField(max_digits=8,  decimal_places=2, default=0)
    total        = models.DecimalField(max_digits=12, decimal_places=2)
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes        = models.TextField(blank=True)
    arc_unlock_processed = models.BooleanField(default=False)

    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)
 
    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']
 
    def __str__(self):
        return f'Order #{str(self.id)[:8]} — {self.user.name}'
 
 
class OrderItem(models.Model):
    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order      = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product    = models.ForeignKey(Product, on_delete=models.PROTECT)
    product_name = models.CharField(max_length=255)  # snapshot at order time
    quantity   = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
 
    class Meta:
        db_table = 'order_items'
 
    @property
    def line_total(self):
        return self.unit_price * self.quantity
 
    def __str__(self):
        return f'{self.quantity}x {self.product_name}'
 


# apps/orders/models.py

import uuid
from django.db import models
from django.conf import settings  # ← ADD THIS
from django.utils import timezone


# ... existing models (Order, OrderItem, etc.) ...


# ═══════════════════════════════════════════════════════
# TREASURE MAP MODELS
# ═══════════════════════════════════════════════════════

class TreasureMap(models.Model):
    MAP_TYPES = [
        ('map_1', 'Golden Desert'),
        ('map_2', 'Crystal Ocean'),
        ('map_3', 'Emerald Forest'),
        ('map_4', 'Ruby Mountain'),
        ('map_5', 'Sapphire Sky'),
        ('map_6', 'Amber Valley'),
        ('map_7', 'Pearl Beach'),
        ('map_8', 'Diamond Peak'),
        ('map_9', 'Jungle Mystery'),
        ('map_10', 'Arctic Treasure'),
        ('map_11', 'Volcano Gold'),
        ('map_12', 'Final Kingdom'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    map_type = models.CharField(max_length=20, choices=MAP_TYPES, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='maps/', blank=True, null=True)
    
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    
    is_released = models.BooleanField(default=False)
    release_trigger_sales = models.PositiveIntegerField(default=100)
    
    full_set_prize = models.DecimalField(max_digits=10, decimal_places=2, default=100000)
    partial_prize_min_maps = models.PositiveIntegerField(default=3)
    partial_prize_amount = models.DecimalField(max_digits=8, decimal_places=2, default=300)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'treasure_maps'
        ordering = ['map_type']
    
    def __str__(self):
        return f"{self.name} ({self.map_type})"


class CustomerMapClaim(models.Model):
    STATUS_CHOICES = [
        ('claimed', 'Claimed'),
        ('verified', 'Verified'),
        ('rewarded', 'Rewarded'),
        ('expired', 'Expired'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # FIX: Use settings.AUTH_USER_MODEL instead of User
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='map_claims'
    )
    
    map = models.ForeignKey(
        TreasureMap, 
        on_delete=models.CASCADE, 
        related_name='claims'
    )
    
    order = models.ForeignKey(
        'Order',  # String reference to avoid circular import
        on_delete=models.CASCADE, 
        related_name='map_claims'
    )
    
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='claimed')
    claimed_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    rewarded_at = models.DateTimeField(null=True, blank=True)
    reward_amount = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    
    class Meta:
        db_table = 'customer_map_claims'
        unique_together = ['customer', 'map']
        ordering = ['-claimed_at']


class CustomerMapProgress(models.Model):
    customer = models.OneToOneField(
        settings.AUTH_USER_MODEL,  # FIX: Use settings.AUTH_USER_MODEL
        on_delete=models.CASCADE, 
        primary_key=True
    )
    total_maps_collected = models.PositiveIntegerField(default=0)
    unique_maps_collected = models.PositiveIntegerField(default=0)
    total_rewards_earned = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    has_completed_all = models.BooleanField(default=False)
    final_reward_claimed = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'customer_map_progress'