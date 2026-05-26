# apps/coupons/admin.py
from django.contrib import admin
from .models import Coupon, QROffer, QRScanLog

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display  = ('code', 'discount_type', 'discount_value',
                     'used_count', 'max_uses', 'is_active', 'expires_at')
    list_filter   = ('discount_type', 'is_active')
    search_fields = ('code',)
    list_editable = ('is_active',)

@admin.register(QROffer)
class QROfferAdmin(admin.ModelAdmin):
    list_display = ['title', 'qr_code_id', 'reveal_type', 'scan_count',
                    'max_scans', 'is_active', 'is_valid']
    list_filter = ['reveal_type', 'is_active']
    search_fields = ['title', 'qr_code_id']
    readonly_fields = ['qr_code_id', 'scan_count', 'qr_image']

@admin.register(QRScanLog)
class QRScanLogAdmin(admin.ModelAdmin):
    list_display = ['qr_offer', 'discount_revealed', 'coupon_code',
                    'is_used', 'scanned_at', 'expires_at']
    list_filter = ['is_used']
    search_fields = ['coupon_code', 'device_id']