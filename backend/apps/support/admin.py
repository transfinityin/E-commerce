from django.contrib import admin
from apps.support.models import SupportTicket, TicketMessage
# Register your models here.

# ── Support ───────────────────────────────────────────────────
class TicketMessageInline(admin.TabularInline):
    model = TicketMessage
    extra = 1
 
@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display  = ('subject', 'user', 'status', 'priority', 'created_at')
    list_filter   = ('status', 'priority')
    search_fields = ('subject', 'user__email')
    list_editable = ('status', 'priority')
    inlines       = [TicketMessageInline]
 