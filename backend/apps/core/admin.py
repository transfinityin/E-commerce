from django.contrib import admin
from .models import HeroBanner


@admin.register(HeroBanner)
class HeroBannerAdmin(admin.ModelAdmin):
    list_display = ['title', 'is_active', 'display_order', 'created_at']
    list_filter = ['is_active']
    search_fields = ['title', 'subtitle']
    ordering = ['display_order']
    list_editable = ['is_active', 'display_order']
    
    fieldsets = (
        (None, {
            'fields': ('title', 'subtitle', 'image', 'mobile_image')
        }),
        ('CTA', {
            'fields': ('cta_text', 'cta_link')
        }),
        ('Settings', {
            'fields': ('is_active', 'display_order')
        }),
    )