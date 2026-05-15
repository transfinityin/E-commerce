from django.contrib import admin
from apps.notifications.models import Notification
# Register your models here.
 
# ── Notifications ─────────────────────────────────────────────
@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'type', 'is_read', 'created_at')
    list_filter  = ('type', 'is_read')