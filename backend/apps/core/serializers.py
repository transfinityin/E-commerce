from rest_framework import serializers
from .models import HeroBanner


class HeroBannerSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    mobile_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = HeroBanner
        fields = [
            'id', 'title', 'subtitle', 'image_url', 'mobile_image_url',
            'cta_text', 'cta_link', 'is_active', 'display_order', 'created_at'
        ]
    
    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None
    
    def get_mobile_image_url(self, obj):
        request = self.context.get('request')
        if obj.mobile_image and request:
            return request.build_absolute_uri(obj.mobile_image.url)
        return None