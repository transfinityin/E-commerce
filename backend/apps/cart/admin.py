from django.contrib import admin
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
# from apps.orders.models import Cart, CartItem
from apps.cart.models import Cart, CartItem   
# ── Cart ──────────────────────────────────────────────────────
class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
 
@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'total_items', 'updated_at')
    inlines      = [CartItemInline]
 