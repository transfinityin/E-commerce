from django.contrib import admin
from apps.orders.models import Order, OrderItem
# Register your models here.

# ── Orders ────────────────────────────────────────────────────


class OrderItemInline(admin.TabularInline):
    model     = OrderItem
    extra     = 0
    readonly_fields = ('line_total',)
 
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display   = ('id', 'user', 'status', 'total', 'created_at')
    list_filter    = ('status',)
    search_fields  = ('user__email', 'user__name')
    readonly_fields = ('subtotal', 'discount', 'total', 'created_at')
    inlines        = [OrderItemInline]
    list_editable  = ('status',)