from django.contrib import admin
from apps.wishlist.models import Wishlist
# Register your models here.

# ── Wishlist ──────────────────────────────────────────────────

class WishlistAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'created_at']  # was 'added_at'
    list_filter = ['created_at']
    search_fields = ['user__email', 'product__name']