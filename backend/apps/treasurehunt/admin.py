from django.contrib import admin
from .models import TShirtQRCode, HuntLocation, UserHuntProgress, HuntReward, HuntLeaderboard

@admin.register(TShirtQRCode)
class TShirtQRCodeAdmin(admin.ModelAdmin):
    list_display = ['secret_hash', 'order', 'is_activated', 'activated_by', 'created_at']
    list_filter = ['is_activated', 'created_at']
    search_fields = ['secret_hash', 'order__id', 'activated_by__email']
    readonly_fields = ['id', 'created_at', 'activated_at']

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('order', 'activated_by')

@admin.register(HuntLocation)
class HuntLocationAdmin(admin.ModelAdmin):
    list_display = ['level', 'name', 'geo_lat', 'geo_long', 'geo_radius_meters', 'is_active']
    list_filter = ['level', 'is_active']
    search_fields = ['name', 'clue_text_english']
    ordering = ['level']

@admin.register(UserHuntProgress)
class UserHuntProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'current_level', 'is_completed', 'started_at', 'last_unlocked_at']
    list_filter = ['current_level', 'started_at']
    search_fields = ['user__name', 'user__email']
    readonly_fields = ['id', 'started_at']

@admin.register(HuntReward)
class HuntRewardAdmin(admin.ModelAdmin):
    list_display = ['user', 'level', 'coupon', 'claimed_at']
    list_filter = ['level', 'claimed_at']
    search_fields = ['user__name', 'coupon__code']

@admin.register(HuntLeaderboard)
class HuntLeaderboardAdmin(admin.ModelAdmin):
    list_display = ['rank', 'user', 'score', 'updated_at']
    list_filter = ['updated_at']
    search_fields = ['user__name']
    ordering = ['rank']