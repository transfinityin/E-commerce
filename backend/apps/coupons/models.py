from django.db import models
import uuid
from django.db import models
from django.conf import settings
from apps.products.models import Product

from django.utils import timezone
import secrets
import qrcode
from io import BytesIO
from django.core.files.base import ContentFile
# Create your models here.

# ── Coupon ────────────────────────────────────────────────────
class Coupon(models.Model):
    DISCOUNT_TYPES = [('percent', 'Percentage'), ('flat', 'Flat Amount')]
 
    id             = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code           = models.CharField(max_length=50, unique=True)
    description    = models.CharField(max_length=200, blank=True)
    discount_type  = models.CharField(max_length=10, choices=DISCOUNT_TYPES)
    discount_value = models.DecimalField(max_digits=8, decimal_places=2)
    min_order      = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_discount   = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    max_uses       = models.PositiveIntegerField(default=0)  # 0 = unlimited
    used_count     = models.PositiveIntegerField(default=0)
    is_active      = models.BooleanField(default=True)
    expires_at     = models.DateTimeField(null=True, blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        db_table = 'coupons'
 
    def __str__(self):
        return self.code
 
    def calculate_discount(self, subtotal):
        if self.discount_type == 'percent':
            discount = subtotal * self.discount_value / 100
            if self.max_discount:
                discount = min(discount, self.max_discount)
        else:
            discount = self.discount_value
        return min(discount, subtotal)



# ═══════════════════════════════════════════════════════
# NEW: QR Offer Model (Add this below Coupon model)
# ═══════════════════════════════════════════════════════

class QROffer(models.Model):
    REVEAL_TYPES = [
        ('fixed', 'Fixed Discount'),
        ('random', 'Random Discount'),
        ('spin', 'Spin Wheel'),
        ('scratch', 'Scratch Card'),
    ]
    
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title       = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    # QR Code unique identifier
    qr_code_id  = models.CharField(max_length=32, unique=True, editable=False)
    
    # Reveal settings
    reveal_type = models.CharField(max_length=10, choices=REVEAL_TYPES, default='random')
    
    # Discount range (for random/spin)
    min_discount = models.DecimalField(max_digits=5, decimal_places=2, default=5)
    max_discount = models.DecimalField(max_digits=5, decimal_places=2, default=50)
    
    # Fixed discount (for fixed type)
    fixed_discount = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # Link to actual coupon (auto-created when QR is scanned)
    coupon      = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True, related_name='qr_offers')
    
    # QR Code image
    qr_image    = models.ImageField(upload_to='qr_codes/', blank=True, null=True)
    
    # Limits & Status
    max_scans   = models.PositiveIntegerField(default=100)  # 0 = unlimited
    scan_count  = models.PositiveIntegerField(default=0)
    is_active   = models.BooleanField(default=True)
    
    # Time limits
    valid_from  = models.DateTimeField(default=timezone.now)
    valid_until = models.DateTimeField(null=True, blank=True)
    
    # Scan expiry (minutes after first scan)
    scan_expiry_minutes = models.PositiveIntegerField(default=30)
    
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'qr_offers'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.qr_code_id})"

    def save(self, *args, **kwargs):
        if not self.qr_code_id:
            self.qr_code_id = secrets.token_urlsafe(16)[:20]
        super().save(*args, **kwargs)
        # Generate QR image if not exists
        if not self.qr_image:
            self.generate_qr_image()

    def generate_qr_image(self):
        """Generate QR code image"""
        # Frontend URL - customer scans this
        frontend_url = getattr(settings, 'FRONTEND_URL', 'https://www.transfinity.shop')
        scan_url = f"{frontend_url}/scan/{self.qr_code_id}"
        
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(scan_url)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        
        filename = f'qr_{self.qr_code_id}.png'
        self.qr_image.save(filename, ContentFile(buffer.getvalue()), save=False)
        self.save(update_fields=['qr_image'])

    def is_valid(self):
        now = timezone.now()
        if not self.is_active:
            return False
        if self.valid_until and self.valid_until < now:
            return False
        if self.max_scans > 0 and self.scan_count >= self.max_scans:
            return False
        return True

    def get_random_discount(self):
        """Generate random discount based on settings"""
        import random
        if self.reveal_type == 'fixed' and self.fixed_discount:
            return self.fixed_discount
        return round(random.uniform(float(self.min_discount), float(self.max_discount)), 2)


# ═══════════════════════════════════════════════════════
# NEW: QR Scan Log (Track each scan)
# ═══════════════════════════════════════════════════════

class QRScanLog(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    qr_offer    = models.ForeignKey(QROffer, on_delete=models.CASCADE, related_name='scan_logs')
    
    # Who scanned
    user        = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    device_id   = models.CharField(max_length=100, blank=True)  # For non-logged in users
    ip_address  = models.GenericIPAddressField(null=True, blank=True)
    
    # What they got
    discount_revealed = models.DecimalField(max_digits=5, decimal_places=2)
    coupon_code       = models.CharField(max_length=50, blank=True)
    
    # Status
    is_used     = models.BooleanField(default=False)
    used_at     = models.DateTimeField(null=True, blank=True)
    expires_at  = models.DateTimeField()  # Coupon must be used before this
    
    scanned_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'qr_scan_logs'
        ordering = ['-scanned_at']

    def __str__(self):
        return f"Scan {self.qr_code_id} - {self.discount_revealed}%"