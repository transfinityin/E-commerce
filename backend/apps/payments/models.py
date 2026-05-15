
from django.db import models
import uuid
from django.db import models
from django.conf import settings
from apps.products.models import Product
from apps.orders.models import Order
# Create your models here.

# ── Payment ───────────────────────────────────────────────────
class Payment(models.Model):
    STATUS_CHOICES = [
        ('pending',  'Pending'),
        ('success',  'Success'),
        ('failed',   'Failed'),
        ('refunded', 'Refunded'),
    ]
 
    id             = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order          = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    provider       = models.CharField(max_length=50, default='razorpay')
    razorpay_order_id  = models.CharField(max_length=200, blank=True)
    razorpay_payment_id = models.CharField(max_length=200, blank=True)
    razorpay_signature  = models.CharField(max_length=500, blank=True)
    amount         = models.DecimalField(max_digits=12, decimal_places=2)
    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    paid_at        = models.DateTimeField(null=True, blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        db_table = 'payments'
 
    def __str__(self):
        return f'Payment for Order #{str(self.order.id)[:8]}'
 