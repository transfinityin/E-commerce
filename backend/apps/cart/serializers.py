from rest_framework import serializers
from apps.orders.models import Cart, CartItem
from apps.products.serializers import ProductListSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product    = ProductListSerializer(read_only=True)
    product_id = serializers.UUIDField(write_only=True)
    line_total = serializers.ReadOnlyField()

    class Meta:
        model  = CartItem
        fields = ('id', 'product','size', 'product_id', 'quantity', 'line_total')
        read_only_fields = ('id',)


class CartSerializer(serializers.ModelSerializer):
    items       = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.ReadOnlyField()
    subtotal    = serializers.ReadOnlyField()

    class Meta:
        model  = Cart
        fields = ('id', 'items', 'total_items', 'subtotal', 'updated_at')