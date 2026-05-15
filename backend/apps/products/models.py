from django.db import models

# Create your models here.
import uuid
from django.db import models
from django.conf import settings
from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import SearchVectorField

class Category(models.Model):
    id        = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name      = models.CharField(max_length=100)
    slug      = models.SlugField(unique=True)
    parent    = models.ForeignKey('self', on_delete=models.SET_NULL,
                                  null=True, blank=True, related_name='children')
    image     = models.ImageField(upload_to='categories/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table  = 'categories'
        verbose_name_plural = 'categories'
        ordering  = ['name']

    def __str__(self):
        return self.name


class Product(models.Model):
    SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # owner_id → migration-ready for multi-vendor (currently always admin)
    owner       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                    related_name='products')
    category    = models.ForeignKey(Category, on_delete=models.SET_NULL,
                                    null=True, related_name='products')
    name        = models.CharField(max_length=255)
    available_sizes = models.JSONField(default=list, blank=True)

    slug        = models.SlugField(unique=True)
    description = models.TextField()
    price       = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price  = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stock       = models.PositiveIntegerField(default=0)
    sku         = models.CharField(max_length=100, unique=True, blank=True)
    weight      = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    rating_avg  = models.FloatField(default=0.0)
    rating_count = models.PositiveIntegerField(default=0)
    is_active   = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)
    tags = models.CharField(
        max_length=1000, blank=True,
        help_text='Keywords: tshirt t-shirt shirt cotton men'
    )
    search_vector = SearchVectorField(null=True, blank=True)
    class Meta:
        db_table = 'products'
        ordering = ['-created_at']
        indexes = [
            GinIndex(fields=['search_vector'], name='product_search_idx'),
            GinIndex(
                name='product_trgm_idx',
                fields=['name'],
                opclasses=['gin_trgm_ops'],
            ),
        ]

    def __str__(self):
        return self.name

    @property
    def effective_price(self):
        return self.sale_price if self.sale_price else self.price

    @property
    def in_stock(self):
        return self.stock > 0

    @property
    def discount_percent(self):
        if self.sale_price and self.price > 0:
            return round((1 - self.sale_price / self.price) * 100)
        return 0


class ProductImage(models.Model):
    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product    = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image      = models.ImageField(upload_to='products/')
    alt_text   = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'product_images'
        ordering = ['sort_order']

    def save(self, *args, **kwargs):
        if self.is_primary:
            ProductImage.objects.filter(product=self.product, is_primary=True).update(is_primary=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.product.name} — image {self.sort_order}'