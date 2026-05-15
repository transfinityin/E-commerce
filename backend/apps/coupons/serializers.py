from rest_framework import serializers
from apps.orders.models import Coupon
from django.utils import timezone

from .models import Coupon, QROffer, QRScanLog

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Coupon
        fields = ('id','code','description','discount_type','discount_value',
                  'min_order','max_discount','max_uses','used_count',
                  'is_active','expires_at','created_at')
        read_only_fields = ('id','used_count','created_at')


class CouponValidateSerializer(serializers.Serializer):
    code     = serializers.CharField()
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2)

    def validate(self, attrs):
        code = attrs['code'].upper()
        subtotal = attrs['subtotal']

        try:
            coupon = Coupon.objects.get(code=code, is_active=True)
        except Coupon.DoesNotExist:
            raise serializers.ValidationError({'code': 'Invalid or expired coupon.'})

        if coupon.expires_at and coupon.expires_at < timezone.now():
            raise serializers.ValidationError({'code': 'Coupon has expired.'})

        if coupon.max_uses > 0 and coupon.used_count >= coupon.max_uses:
            raise serializers.ValidationError({'code': 'Coupon usage limit reached.'})

        if subtotal < coupon.min_order:
            raise serializers.ValidationError({
                'code': f'Minimum order amount is ₹{coupon.min_order}.'
            })

        attrs['coupon']   = coupon
        attrs['discount'] = coupon.calculate_discount(subtotal)
        return attrs




# ═══════════════════════════════════════════════════════
# NEW: QR Offer Serializers
# ═══════════════════════════════════════════════════════

class QROfferSerializer(serializers.ModelSerializer):
    qr_image_url = serializers.SerializerMethodField()
    is_valid_now = serializers.BooleanField(source='is_valid', read_only=True)
    
    class Meta:
        model = QROffer
        fields = [
            'id', 'title', 'description', 'qr_code_id', 'reveal_type',
            'min_discount', 'max_discount', 'fixed_discount',
            'max_scans', 'scan_count', 'is_active', 'is_valid_now',
            'valid_from', 'valid_until', 'scan_expiry_minutes',
            'qr_image_url', 'created_at'
        ]
        read_only_fields = ['id', 'qr_code_id', 'scan_count', 'created_at']

    def get_qr_image_url(self, obj):
        request = self.context.get('request')
        if obj.qr_image and request:
            return request.build_absolute_uri(obj.qr_image.url)
        return None


class QRScanResponseSerializer(serializers.Serializer):
    """Response when customer scans QR"""
    success = serializers.BooleanField()
    message = serializers.CharField()
    reveal_type = serializers.CharField(required=False)
    discount = serializers.DecimalField(max_digits=5, decimal_places=2, required=False)
    coupon_code = serializers.CharField(required=False)
    expires_at = serializers.DateTimeField(required=False)
    title = serializers.CharField(required=False)


class QRScanLogSerializer(serializers.ModelSerializer):
    qr_offer_title = serializers.CharField(source='qr_offer.title', read_only=True)
    
    class Meta:
        model = QRScanLog
        fields = ['id', 'qr_offer_title', 'discount_revealed', 'coupon_code', 
                  'is_used', 'scanned_at', 'expires_at']    