from rest_framework import serializers
from .models import HeroBanner


class HeroBannerSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = HeroBanner
        fields = [
            'id', 'title', 'subtitle',
            'image_url',
            'image_url_direct',
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
    def create(self, validated_data):
        return super().create(validated_data)

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)