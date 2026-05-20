from rest_framework import serializers
from .models import HeroBanner


class HeroBannerSerializer(serializers.ModelSerializer):
    # Frontend sends image_url as string → save to image_url_direct
    image_url = serializers.SerializerMethodField()

    class Meta:
        model  = HeroBanner
        fields = [
            'id', 'title', 'subtitle',
            'image_url',
            'image_url_direct',     # frontend la upload panna URL
            'cta_text', 'cta_link',
            'is_active', 'display_order', 'created_at',
        ]

    def get_image_url(self, obj):
        # Priority: direct URL → cloudinary image field
        if obj.image_url_direct:
            return obj.image_url_direct
        request = self.context.get('request')
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def create(self, validated_data):
        return super().create(validated_data)

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)