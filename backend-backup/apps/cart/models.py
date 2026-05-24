from django.db import models
import uuid
from django.db import models
from django.conf import settings
from apps.products.models import Product
 
# Create your models here.

# ── Cart ─────────────────────────────────────────────────────
class Cart(models.Model):
    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user       = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                      related_name='cart')
    updated_at = models.DateTimeField(auto_now=True)
 
    class Meta:
        db_table = 'cart'
 
    def __str__(self):
        return f'Cart of {self.user.name}'
 
    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())
 
    @property
    def subtotal(self):
        return sum(item.line_total for item in self.items.all())
 
 
class CartItem(models.Model):
    id       = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cart     = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product  = models.ForeignKey(Product, on_delete=models.CASCADE)
    size     = models.CharField(max_length=10, blank=True, null=True)  # 👈 ADD THIS

    quantity = models.PositiveIntegerField(default=1)
    
 
    class Meta:
        db_table = 'cart_items'
        unique_together = ('cart', 'product','size')
 
    def __str__(self):
        return f'{self.quantity}x {self.product.name}'
 
    @property
    def line_total(self):
        return self.product.effective_price * self.quantity
 