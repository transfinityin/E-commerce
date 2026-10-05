from rest_framework import serializers
from .models import Category, Product, ProductImage


class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    class Meta:
        model  = Category
        fields = ('id', 'name', 'slug', 'parent', 'image', 'is_active', 'children')
        read_only_fields = ('id',)
    def get_children(self, obj):
        children = obj.children.filter(is_active=True)
        return CategorySerializer(children, many=True, context=self.context).data


class CategorySimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Category
        fields = ('id', 'name', 'slug')


# class ProductImageSerializer(serializers.ModelSerializer):
#     image = serializers.SerializerMethodField()
#     class Meta:
#         model  = ProductImage
#         fields = ('id', 'image', 'alt_text', 'is_primary', 'sort_order')
#         read_only_fields = ('id',)
#     def get_image(self, obj):
#         if obj.image:
#             request = self.context.get('request')
#             if request:
#                 return request.build_absolute_uri(obj.image.url)
#             # Fallback if request not in context
#             from django.conf import settings
#             site_url = getattr(settings, 'SITE_URL', 'http://localhost:8000')
#             return f"{site_url}{obj.image.url}"
#         return None

class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model  = ProductImage
        fields = ('id', 'image', 'alt_text', 'is_primary', 'sort_order')
        read_only_fields = ('id',)

    def get_image(self, obj):
        if not obj.image:
            return None
        
        # FIX: obj.image could be a plain URL string (Cloudinary) 
        # or an ImageField object — handle both
        if isinstance(obj.image, str):
            return obj.image  # already a full URL string, return as-is
        
        # ImageField object — build absolute URI
        try:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        except Exception:
            return str(obj.image)
class ProductListSerializer(serializers.ModelSerializer):
    category         = CategorySimpleSerializer(read_only=True)
    primary_image    = serializers.SerializerMethodField()
    discount_percent = serializers.ReadOnlyField()
    images = ProductImageSerializer(many=True, read_only=True)  # ← ADD THIS LINE
    in_stock         = serializers.ReadOnlyField()
    effective_price  = serializers.ReadOnlyField()
    class Meta:
        model  = Product
        # fields = ('id','name','slug','description','category','price','sale_price',
        #           'effective_price','discount_percent','stock','in_stock',
        #           'rating_avg','rating_count','is_featured','primary_image')
        fields = (
            'id', 'name', 'slug', 'description', 'category',
            'price', 'sale_price', 'effective_price', 'discount_percent',
            'stock', 'in_stock', 'sku', 'weight',
            'rating_avg', 'rating_count',
            'is_active', 'is_featured',
            'available_sizes',   # ← add this
            'primary_image', 'images','created_at', 'updated_at',
        )
    def get_primary_image(self, obj):
        img = obj.images.filter(is_primary=True).first() or obj.images.first()
        if img:
            return ProductImageSerializer(img, context=self.context).data
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    category         = CategorySimpleSerializer(read_only=True)
    images           = ProductImageSerializer(many=True, read_only=True)
    discount_percent = serializers.ReadOnlyField()
    in_stock         = serializers.ReadOnlyField()
    effective_price  = serializers.ReadOnlyField()
    class Meta:
        model  = Product
        fields = ('id','name','slug','description','category','price','sale_price',
                  'effective_price','discount_percent','stock','in_stock','sku',
                  'weight','rating_avg','rating_count','is_active','is_featured','available_sizes',
                  'images','created_at','updated_at')


class ProductWriteSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), allow_null=True, required=False
    )
    sale_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, allow_null=True, required=False
    )
    sku = serializers.CharField(allow_blank=True, required=False)

    class Meta:
        model  = Product
        fields = ('id','name','slug','description','category','price','sale_price',
                  'stock','sku','weight','is_active','is_featured','available_sizes')
        read_only_fields = ('id',)

    def validate_sku(self, value):
        value = (value or '').strip()
        if not value:
            # unique=True + blank='' collides in Postgres — mint a unique SKU
            import uuid
            return f'SKU-{uuid.uuid4().hex[:10].upper()}'
        qs = Product.objects.filter(sku=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('SKU already exists.')
        return value

    def validate_sale_price(self, value):
        if value in ('', None):
            return None
        return value

    def validate_category(self, value):
        if value in ('', None):
            return None
        return value

    def validate(self, attrs):
        sale = attrs.get('sale_price', getattr(self.instance, 'sale_price', None))
        price = attrs.get('price', getattr(self.instance, 'price', None))
        if sale is not None and price is not None and sale >= price:
            raise serializers.ValidationError(
                {'sale_price': 'Sale price must be less than original price.'})
        return attrs

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)