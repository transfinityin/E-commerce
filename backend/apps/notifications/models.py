from django.db import models
import uuid
from django.db import models
from django.conf import settings
from apps.products.models import Product
 
# Create your models here.

# ── Notification ──────────────────────────────────────────────
class Notification(models.Model):
    TYPES = [
        ('order',   'Order Update'),
        ('promo',   'Promotion'),
        ('system',  'System'),
        ('support', 'Support Reply'),
    ]
 
    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                   related_name='notifications')
    type       = models.CharField(max_length=20, choices=TYPES, default='system')
    title      = models.CharField(max_length=200)
    message    = models.TextField()
    link       = models.CharField(max_length=500, blank=True)
    is_read    = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
 
    def __str__(self):
        return f'{self.user.name} — {self.title}'
 