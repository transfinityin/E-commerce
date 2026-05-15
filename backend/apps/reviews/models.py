from django.db import models
from django.db import models
import uuid
from django.db import models
from django.conf import settings
from apps.products.models import Product
from apps.orders.models import Order
# Create your models here.


# ── Review ────────────────────────────────────────────────────
class Review(models.Model):
    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                   related_name='reviews')
    product    = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    order      = models.ForeignKey(Order, on_delete=models.SET_NULL,
                                   null=True, related_name='reviews')
    rating     = models.PositiveSmallIntegerField()  # 1–5
    title      = models.CharField(max_length=200, blank=True)
    comment    = models.TextField()
    is_verified = models.BooleanField(default=False)  # verified purchase
    created_at = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        db_table = 'reviews'
        unique_together = ('user', 'product')
        ordering = ['-created_at']
 
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Recalculate product rating
        product = self.product
        reviews = Review.objects.filter(product=product)
        product.rating_avg   = reviews.aggregate(models.Avg('rating'))['rating__avg'] or 0
        product.rating_count = reviews.count()
        product.save(update_fields=['rating_avg', 'rating_count'])
 
    def __str__(self):
        return f'{self.user.name} — {self.product.name} ({self.rating}★)'
 
 