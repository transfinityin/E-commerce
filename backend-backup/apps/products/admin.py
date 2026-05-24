# from django.contrib import admin
# from apps.products.models import Category, Product, ProductImage


# # ── Category ──────────────────────────────────────────────────
# @admin.register(Category)
# class CategoryAdmin(admin.ModelAdmin):
#     list_display  = ('name', 'slug', 'parent', 'is_active')
#     list_filter   = ('is_active',)
#     search_fields = ('name',)
#     prepopulated_fields = {'slug': ('name',)}


# # ── Product Image Inline ─────────────────────────────────────
# class ProductImageInline(admin.TabularInline):
#     model = ProductImage
#     extra = 3


# # ── Product ───────────────────────────────────────────────────
# @admin.register(Product)
# class ProductAdmin(admin.ModelAdmin):
#     list_display   = ('name', 'category', 'price', 'sale_price', 'stock',
#                       'rating_avg', 'is_active', 'is_featured')
#     list_filter    = ('is_active', 'is_featured', 'category')
#     search_fields  = ('name', 'sku')
#     prepopulated_fields = {'slug': ('name',)}
#     inlines        = [ProductImageInline]
#     list_editable  = ('is_active', 'is_featured', 'stock')
#     readonly_fields = ('rating_avg', 'rating_count', 'created_at', 'updated_at')
    
#     # 👇 ADD THIS — fieldsets to organize form
#     fieldsets = (
#         ('Basic Info', {
#             'fields': ('name', 'slug', 'category', 'description', 'owner')
#         }),
#         ('Pricing & Stock', {
#             'fields': ('price', 'sale_price', 'stock', 'sku', 'weight')
#         }),
#         ('Sizes', { 
#             'fields': ('available_sizes',),
#             'description': 'Enter sizes as JSON array: ["S", "M", "L", "XL", "XXL"]'
#         }),
#         ('Status', {
#             'fields': ('is_active', 'is_featured', 'tags')
#         }),
#         ('Ratings', {
#             'fields': ('rating_avg', 'rating_count'),
#             'classes': ('collapse',)
#         }),
#         ('Search', {
#             'fields': ('search_vector',),
#             'classes': ('collapse',)
#         }),
#     )



from django.contrib import admin
from apps.products.models import Category, Product, ProductImage


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
    
    # 👇 SIMPLE - no fieldsets, just fields list
    fields = [
        'name', 'slug', 'category', 'description', 'owner',
        'price', 'sale_price', 'stock', 'sku', 'weight',
        'available_sizes',   # 👈 HERE
        'is_active', 'is_featured', 'tags',
        'rating_avg', 'rating_count',
        'created_at', 'updated_at',
    ]