from django.db import models
import uuid
# Create your models here.
# apps/core/models.py
class HeroBanner(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    title = models.CharField(max_length=100)
    subtitle = models.CharField(max_length=200, blank=True)
    image = models.ImageField(upload_to='hero_banners/')
    mobile_image = models.ImageField(upload_to='hero_banners/mobile/', blank=True)
    cta_text = models.CharField(max_length=50, default='Shop Now')
    cta_link = models.CharField(max_length=200, default='/products')
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['display_order']