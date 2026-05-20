from django.db import models
import uuid


class HeroBanner(models.Model):
    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title         = models.CharField(max_length=100)
    subtitle      = models.CharField(max_length=200, blank=True)

    # Option A: File upload (local/cloudinary)
    image         = models.ImageField(upload_to='hero_banners/', blank=True, null=True)
    mobile_image  = models.ImageField(upload_to='hero_banners/mobile/', blank=True, null=True)

    # Option B: Direct URL (from cloudinary upload response)
    image_url_direct     = models.URLField(max_length=500, blank=True)
    mobile_image_url_direct = models.URLField(max_length=500, blank=True)

    cta_text      = models.CharField(max_length=50, default='Shop Now')
    cta_link      = models.CharField(max_length=200, default='/products')
    is_active     = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'hero_banners'
        ordering = ['display_order']

    def __str__(self):
        return self.title