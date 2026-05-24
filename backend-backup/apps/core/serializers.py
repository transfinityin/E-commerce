from rest_framework import serializers
from .models import HeroBanner


class HeroBannerSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField(read_only=True)
    mobile_image_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = HeroBanner
        fields = [
            'id', 'title', 'subtitle',
            'image_url', 'image_url_direct',
            'mobile_image_url', 'mobile_image_url_direct',
            'cta_text', 'cta_link',
            'is_active', 'display_order', 'created_at',
        ]

    def get_image_url(self, obj):
        if obj.image_url_direct:
            return obj.image_url_direct
        if obj.image:
            try:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.image.url)
                return obj.image.url
            except Exception:
                return None
        return None

    def get_mobile_image_url(self, obj):
        print(f"DEBUG: mobile_image_url_direct = {obj.mobile_image_url_direct}")  # Add 
        if obj.mobile_image_url_direct:
            return obj.mobile_image_url_direct
        if obj.mobile_image:
            try:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.mobile_image.url)
                return obj.mobile_image.url
            except Exception:
                return None
        return None


class HeroBannerCreateUpdateSerializer(serializers.ModelSerializer):
    # FIX: Explicit fields with allow_null
    image_url_direct = serializers.URLField(
        max_length=500, 
        allow_null=True, 
        required=False, 
        allow_blank=True
    )
    mobile_image_url_direct = serializers.URLField(
        max_length=500, 
        allow_null=True, 
        required=False, 
        allow_blank=True
    )

    class Meta:
        model = HeroBanner
        fields = [
            'title', 'subtitle',
            'image_url_direct',
            'mobile_image_url_direct',
            'cta_text', 'cta_link',
            'is_active', 'display_order',
        ]

    def validate_mobile_image_url_direct(self, value):
        if value == '' or value is None:
            return ''
        return value

    def validate_image_url_direct(self, value):
        if value == '' or value is None:
            return ''
        return value