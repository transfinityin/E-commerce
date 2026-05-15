from django.contrib import admin
from apps.wishlist.models import Wishlist
# Register your models here.

# ── Wishlist ──────────────────────────────────────────────────
@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'added_at')
 