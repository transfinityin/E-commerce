from rest_framework import serializers
from .models import Order, OrderItem
from apps.products.serializers import ProductListSerializer
from apps.users.serializers import AddressSerializer,UserMiniSerializer  


class OrderItemSerializer(serializers.ModelSerializer):
    product    = ProductListSerializer(read_only=True)
    line_total = serializers.ReadOnlyField()

    class Meta:
        model  = OrderItem
        fields = ('id', 'product', 'product_name', 'quantity', 'unit_price', 'line_total')


class OrderSerializer(serializers.ModelSerializer):
    items   = OrderItemSerializer(many=True, read_only=True)
    address = AddressSerializer(read_only=True)
    user = UserMiniSerializer(read_only=True)  # ← ADD THIS LINE


    class Meta:
        model  = Order
        fields = ('id', 'user', 'address', 'items', 'coupon',
                  'subtotal', 'discount', 'delivery_fee', 'total',
                  'status', 'notes', 'created_at', 'updated_at')
        read_only_fields = ('id', 'user', 'subtotal', 'discount',
                            'delivery_fee', 'total', 'created_at', 'updated_at')


class OrderCreateSerializer(serializers.Serializer):
    address_id = serializers.UUIDField()
    coupon_code = serializers.CharField(required=False, allow_blank=True)
    notes       = serializers.CharField(required=False, allow_blank=True)