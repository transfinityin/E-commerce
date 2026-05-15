from django.db import models
import uuid
from django.db import models
from django.conf import settings
from apps.products.models import Product

# Create your models here.

# ── Wishlist ──────────────────────────────────────────────────
class Wishlist(models.Model):
    id       = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user     = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                 related_name='wishlist')
    product  = models.ForeignKey(Product, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        db_table = 'wishlist'
        unique_together = ('user', 'product')
 
    def __str__(self):
        return f'{self.user.name} ❤ {self.product.name}'
 