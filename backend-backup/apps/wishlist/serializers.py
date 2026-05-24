from rest_framework import serializers
from apps.wishlist.models import Wishlist
from apps.products.serializers import ProductListSerializer


class WishlistSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)

    class Meta:
        model  = Wishlist
        fields = ('id', 'product','created_at')
        read_only_fields = ('id', 'created_at')