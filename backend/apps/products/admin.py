from django.contrib import admin

# Register your models here.
from apps.products.models import Category, Product, ProductImage

# ── Products ──────────────────────────────────────────────────
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display  = ('name', 'slug', 'parent', 'is_active')
    list_filter   = ('is_active',)
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}
 
 
class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 3
 
 
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display   = ('name', 'category', 'price', 'sale_price', 'stock',
                      'rating_avg', 'is_active', 'is_featured')
    list_filter    = ('is_active', 'is_featured', 'category')
    search_fields  = ('name', 'sku')
    prepopulated_fields = {'slug': ('name',)}
    inlines        = [ProductImageInline]
    list_editable  = ('is_active', 'is_featured', 'stock')
    readonly_fields = ('rating_avg', 'rating_count', 'created_at', 'updated_at')
 