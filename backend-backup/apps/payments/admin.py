from django.contrib import admin
from apps.payments.models import Payment
# Register your models here.

# ── Payments ──────────────────────────────────────────────────
@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display  = ('order', 'provider', 'amount', 'status', 'paid_at')
    list_filter   = ('status', 'provider')
    readonly_fields = ('razorpay_order_id', 'razorpay_payment_id',
                       'razorpay_signature', 'paid_at')
 
 