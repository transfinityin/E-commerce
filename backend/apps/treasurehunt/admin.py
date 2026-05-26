# from django.contrib import admin
# from .models import TShirtQRCode, HuntLocation, UserHuntProgress, HuntReward, HuntLeaderboard

# @admin.register(TShirtQRCode)
# class TShirtQRCodeAdmin(admin.ModelAdmin):
#     list_display = ['secret_hash', 'order', 'is_activated', 'activated_by', 'created_at']
#     list_filter = ['is_activated', 'created_at']
#     search_fields = ['secret_hash', 'order__id', 'activated_by__email']
#     readonly_fields = ['id', 'created_at', 'activated_at']

#     def get_queryset(self, request):
#         return super().get_queryset(request).select_related('order', 'activated_by')

# @admin.register(HuntLocation)
# class HuntLocationAdmin(admin.ModelAdmin):
#     list_display = ['level', 'name', 'geo_lat', 'geo_long', 'geo_radius_meters', 'is_active']
#     list_filter = ['level', 'is_active']
#     search_fields = ['name', 'clue_text_english']
#     ordering = ['level']

# @admin.register(UserHuntProgress)
# class UserHuntProgressAdmin(admin.ModelAdmin):
#     list_display = ['user', 'current_level', 'is_completed', 'started_at', 'last_unlocked_at']
#     list_filter = ['current_level', 'started_at']
#     search_fields = ['user__name', 'user__email']
#     readonly_fields = ['id', 'started_at']

# @admin.register(HuntReward)
# class HuntRewardAdmin(admin.ModelAdmin):
#     list_display = ['user', 'level', 'coupon', 'claimed_at']
#     list_filter = ['level', 'claimed_at']
#     search_fields = ['user__name', 'coupon__code']

# @admin.register(HuntLeaderboard)
# class HuntLeaderboardAdmin(admin.ModelAdmin):
#     list_display = ['rank', 'user', 'score', 'updated_at']
#     list_filter = ['updated_at']
#     search_fields = ['user__name']
#     ordering = ['rank']



# # apps/treasurehunt/admin.py
# from django.contrib import admin

# # Try to import old models (if they still exist in database)
# try:
#     from .models import TShirtQRCode, HuntLocation, UserHuntProgress, HuntReward, HuntLeaderboard
#     admin.site.register(TShirtQRCode)
#     admin.site.register(HuntLocation)
#     admin.site.register(UserHuntProgress)
#     admin.site.register(HuntReward)
#     admin.site.register(HuntLeaderboard)
# except ImportError:
#     pass  # Old models not available

# # Import NEW treasure hunt models
# from .models import Arc, ShipPath, Treasure, TreasureClaim, FounderProgress, CommunityUnlockProgress

# @admin.register(Arc)
# class ArcAdmin(admin.ModelAdmin):
#     list_display = ['arc_number', 'name', 'arc_key', 'is_unlocked', 'is_revealed', 'theme_color']
#     list_filter = ['is_unlocked', 'is_revealed', 'unlock_type']
#     search_fields = ['name', 'lore_summary']
#     ordering = ['arc_number']

# @admin.register(ShipPath)
# class ShipPathAdmin(admin.ModelAdmin):
#     list_display = ['from_arc', 'to_arc', 'path_style', 'is_active']
#     list_filter = ['is_active', 'path_style']

# @admin.register(Treasure)
# class TreasureAdmin(admin.ModelAdmin):
#     list_display = ['name', 'arc', 'treasure_type', 'is_active', 'is_available']
#     list_filter = ['treasure_type', 'is_active']

# @admin.register(TreasureClaim)
# class TreasureClaimAdmin(admin.ModelAdmin):
#     list_display = ['treasure', 'user', 'claimed_at']

# @admin.register(FounderProgress)
# class FounderProgressAdmin(admin.ModelAdmin):
#     list_display = ['user', 'current_arc', 'secrets_found', 'total_distance_traveled']

# @admin.register(CommunityUnlockProgress)
# class CommunityUnlockProgressAdmin(admin.ModelAdmin):
#     list_display = ['arc', 'percentage', 'current_sales', 'sales_target', 'is_unlocked']

"""
TRANSFINITY Treasure Hunt - Integrated Django Admin
Path: backend/apps/treasurehunt/admin.py

Full-featured admin panel for managing arcs, treasures, community progress,
user progress, and legacy T-shirt QR hunt data.
"""

from django.contrib import admin
from django.utils.html import format_html
from django.urls import path
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.decorators import method_decorator
import json

from .models import (
    Arc, MysteryCardQR, StorySegment, Challenge, Reward, ShipPath,
    Treasure, TreasureClaim, FounderProgress,
    CommunityUnlockProgress, PurchaseLog,
    TShirtQRCode, HuntLocation, UserHuntProgress,
    HuntReward, HuntLeaderboard,
)


# ═════════════════════════════════════════════════════════════════
# INLINE ADMIN CLASSES
# ═════════════════════════════════════════════════════════════════

class StorySegmentInline(admin.TabularInline):
    model = StorySegment
    extra = 1
    fields = ['order', 'title', 'content', 'image']
    ordering = ['order']


class ChallengeInline(admin.TabularInline):
    model = Challenge
    extra = 1
    fields = ['challenge_key', 'title', 'challenge_type', 'xp_reward', 'order', 'is_active']
    ordering = ['order']


class RewardInline(admin.TabularInline):
    model = Reward
    extra = 1
    fields = ['name', 'reward_type', 'description', 'icon']


class TreasureInline(admin.TabularInline):
    model = Treasure
    extra = 0
    fields = ['name', 'secret_code', 'xp_reward', 'map_x', 'map_y', 'is_active']


class ShipPathInline(admin.TabularInline):
    model = ShipPath
    extra = 0
    fields = ['from_arc', 'to_arc', 'path_style', 'is_active']
    fk_name = 'from_arc'


# ═════════════════════════════════════════════════════════════════
# ARC ADMIN (Enhanced with map editor)
# ═════════════════════════════════════════════════════════════════

@admin.register(Arc)
class ArcAdmin(admin.ModelAdmin):
    list_display = [
        'arc_number', 'name', 'arc_key', 'unlock_type',
        'is_active', 'is_revealed', 'is_unlocked',
        'theme_color_preview', 'position_display',
        'island_icon', 'ambient_effect',
        'created_at'
    ]
    list_filter = [
        'is_active', 'is_revealed', 'is_unlocked',
        'unlock_type', 'ambient_effect', 'island_icon'
    ]
    search_fields = ['name', 'subtitle', 'description', 'arc_key', 'lore_summary']
    list_editable = ['is_active', 'is_revealed', 'is_unlocked']
    ordering = ['arc_number']

    fieldsets = (
        ('Basic Info', {
            'fields': ('arc_key', 'arc_number', 'name', 'subtitle', 'description')
        }),
        ('Visual Design', {
            'fields': ('theme_color', 'island_icon', 'island_size', 'ambient_effect'),
            'description': 'Configure how this arc appears on the world map'
        }),
        ('Map Position', {
            'fields': ('map_x', 'map_y'),
            'description': format_html(
                'Position as percentage (0-100) of map container. '
                '<a href="{}" target="_blank">Open Map Editor</a>',
                '/admin/treasurehunt/arc/map-editor/'
            )
        }),
        ('Lore', {
            'fields': ('lore_summary', 'lore_full', 'hero_name', 'hero_description'),
            'classes': ('collapse',)
        }),
        ('Unlock Settings', {
            'fields': (
                'unlock_type', 'required_rank',
                'sales_target', 'unlock_threshold',
                'unlock_secret_code', 'unlock_date'
            ),
            'description': 'Configure how this arc becomes available to users'
        }),
        ('Status', {
            'fields': ('is_active', 'is_revealed', 'is_unlocked')
        }),
    )

    inlines = [StorySegmentInline, ChallengeInline, RewardInline, TreasureInline, ShipPathInline]

    # Custom actions
    actions = [
        'reveal_arcs', 'hide_arcs',
        'activate_arcs', 'deactivate_arcs',
        'unlock_arcs', 'lock_arcs',
        'reset_community_progress'
    ]

    # Custom admin views
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                'map-editor/',
                self.admin_site.admin_view(self.map_editor),
                name='treasurehunt_arc_map_editor'
            ),
            path(
                '<uuid:arc_id>/reposition/',
                self.admin_site.admin_view(self.reposition_arc),
                name='treasurehunt_arc_reposition'
            ),
            path(
                'api/arcs/',
                self.admin_site.admin_view(self.arcs_api),
                name='treasurehunt_arcs_api'
            ),
        ]
        return custom_urls + urls

    def theme_color_preview(self, obj):
        return format_html(
            '<div style="width: 24px; height: 24px; background: {}; '
            'border-radius: 4px; border: 2px solid #333; display: inline-block;" '
            'title="{}"></div>',
            obj.theme_color, obj.theme_color
        )
    theme_color_preview.short_description = 'Color'

    def position_display(self, obj):
        return format_html(
            '<code style="background: #1a1a2e; padding: 2px 6px; border-radius: 4px;">'
            '({}, {})</code>',
            obj.map_x, obj.map_y
        )
    position_display.short_description = 'Position %'

    # Map Editor View
    def map_editor(self, request):
        """Interactive drag-and-drop map editor"""
        from django.template.response import TemplateResponse

        arcs = Arc.objects.filter(is_active=True).values(
            'id', 'arc_number', 'name', 'map_x', 'map_y',
            'theme_color', 'island_icon', 'is_revealed'
        )

        context = {
            **self.admin_site.each_context(request),
            'title': 'Transfinity Map Editor',
            'arcs': list(arcs),
            'opts': self.model._meta,
        }
        return TemplateResponse(request, 'admin/treasurehunt/map_editor.html', context)

    # AJAX reposition endpoint
    def reposition_arc(self, request, arc_id):
        if request.method != 'POST':
            return JsonResponse({'error': 'POST required'}, status=405)

        try:
            data = json.loads(request.body)
            arc = get_object_or_404(Arc, id=arc_id)
            arc.map_x = max(0, min(100, float(data.get('x', arc.map_x))))
            arc.map_y = max(0, min(100, float(data.get('y', arc.map_y))))
            arc.save(update_fields=['map_x', 'map_y'])
            return JsonResponse({
                'success': True,
                'arc_id': str(arc.id),
                'x': arc.map_x,
                'y': arc.map_y
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    # API for map editor
    def arcs_api(self, request):
        arcs = Arc.objects.all().values(
            'id', 'arc_number', 'name', 'map_x', 'map_y',
            'theme_color', 'island_icon', 'is_active', 'is_revealed', 'is_unlocked'
        )
        return JsonResponse(list(arcs), safe=False)

    # Bulk actions
    @admin.action(description='🔓 Reveal selected arcs on map')
    def reveal_arcs(self, request, queryset):
        count = queryset.update(is_revealed=True)
        self.message_user(request, f'{count} arc(s) revealed on the map.')

    @admin.action(description='🌫️ Hide selected arcs from map')
    def hide_arcs(self, request, queryset):
        count = queryset.update(is_revealed=False)
        self.message_user(request, f'{count} arc(s) hidden from the map.')

    @admin.action(description='✅ Activate selected arcs')
    def activate_arcs(self, request, queryset):
        count = queryset.update(is_active=True)
        self.message_user(request, f'{count} arc(s) activated.')

    @admin.action(description='❌ Deactivate selected arcs')
    def deactivate_arcs(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f'{count} arc(s) deactivated.')

    @admin.action(description='🔓 Unlock selected arcs')
    def unlock_arcs(self, request, queryset):
        count = queryset.update(is_unlocked=True, is_revealed=True)
        self.message_user(request, f'{count} arc(s) unlocked for all users.')

    @admin.action(description='🔒 Lock selected arcs')
    def lock_arcs(self, request, queryset):
        count = queryset.update(is_unlocked=False)
        self.message_user(request, f'{count} arc(s) locked.')

    @admin.action(description='🔄 Reset community progress for selected arcs')
    def reset_community_progress(self, request, queryset):
        from .models import CommunityUnlockProgress
        count = 0
        for arc in queryset:
            try:
                cp = arc.community_progress
                cp.current_sales = 0
                cp.current_purchases = 0
                cp.is_unlocked = False
                cp.unlocked_at = None
                cp.contributing_users = []
                cp.milestone_25 = False
                cp.milestone_50 = False
                cp.milestone_75 = False
                cp.milestone_90 = False
                cp.save()
                count += 1
            except CommunityUnlockProgress.DoesNotExist:
                continue
        self.message_user(request, f'Reset community progress for {count} arc(s).')


# ═════════════════════════════════════════════════════════════════
# FOUNDER PROGRESS ADMIN
# ═════════════════════════════════════════════════════════════════

@admin.register(FounderProgress)
class FounderProgressAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'current_arc_display', 'secrets_found',
        'total_distance_traveled', 'visited_count',
        'updated_at'
    ]
    list_filter = ['created_at', 'updated_at']
    search_fields = ['user__username', 'user__email', 'user__name']
    readonly_fields = ['created_at', 'updated_at']
    filter_horizontal = ['visited_arcs', 'discovered_treasures']

    fieldsets = (
        ('User', {
            'fields': ('user', 'current_arc')
        }),
        ('Exploration', {
            'fields': ('visited_arcs', 'discovered_treasures', 'secrets_found', 'total_distance_traveled')
        }),
        ('Meta', {
            'fields': ('last_login_scene', 'created_at', 'updated_at')
        }),
    )

    actions = ['reset_progress', 'award_xp_1000', 'unlock_all_arcs', 'award_all_treasures']

    def current_arc_display(self, obj):
        if obj.current_arc:
            return format_html(
                '<span style="color: {}">{}</span>',
                obj.current_arc.theme_color,
                obj.current_arc.name
            )
        return '-'
    current_arc_display.short_description = 'Current Arc'

    def visited_count(self, obj):
        return obj.visited_arcs.count()
    visited_count.short_description = 'Visited'

    @admin.action(description="🔄 Reset selected users' progress")
    def reset_progress(self, request, queryset):
        first_arc = Arc.objects.get(arc_number=1)
        count = queryset.update(
            current_arc=first_arc,
            secrets_found=0,
            total_distance_traveled=0,
            last_login_scene='map'
        )
        for progress in queryset:
            progress.visited_arcs.clear()
            progress.discovered_treasures.clear()
        self.message_user(request, f'Reset progress for {count} user(s).')

    @admin.action(description="⚡ Award 1000 XP to selected users")
    def award_xp_1000(self, request, queryset):
        awarded = 0
        for progress in queryset:
            if hasattr(progress.user, 'add_xp'):
                progress.user.add_xp(1000)
                awarded += 1
        self.message_user(request, f'Awarded 1000 XP to {awarded} user(s).')

    @admin.action(description="🔓 Unlock all arcs for selected users")
    def unlock_all_arcs(self, request, queryset):
        all_arcs = Arc.objects.filter(is_active=True)
        count = 0
        for progress in queryset:
            for arc in all_arcs:
                progress.visit_arc(arc)
            count += 1
        self.message_user(request, f'Unlocked all arcs for {count} user(s).')

    @admin.action(description="💎 Award all treasures to selected users")
    def award_all_treasures(self, request, queryset):
        all_treasures = Treasure.objects.filter(is_active=True)
        count = 0
        for progress in queryset:
            for treasure in all_treasures:
                progress.discover_treasure(treasure)
            count += 1
        self.message_user(request, f'Awarded all treasures to {count} user(s).')


# ═════════════════════════════════════════════════════════════════
# COMMUNITY UNLOCK PROGRESS ADMIN
# ═════════════════════════════════════════════════════════════════

@admin.register(CommunityUnlockProgress)
class CommunityUnlockProgressAdmin(admin.ModelAdmin):
    list_display = [
        'arc', 'progress_bar', 'percentage_display',
        'current_purchases', 'target_purchases',
        'is_unlocked', 'unlocked_at', 'contributor_count',
        'updated_at'
    ]
    list_filter = ['is_unlocked', 'created_at', 'updated_at']
    readonly_fields = ['created_at', 'updated_at', 'unlocked_at']
    search_fields = ['arc__name']

    fieldsets = (
        ('Arc', {
            'fields': ('arc',)
        }),
        ('Progress', {
            'fields': ('current_sales', 'sales_target', 'current_purchases', 'target_purchases', 'is_unlocked')
        }),
        ('Milestones', {
            'fields': ('milestone_25', 'milestone_50', 'milestone_75', 'milestone_90')
        }),
        ('Contributors', {
            'fields': ('contributing_users', 'participant_count')
        }),
        ('Timestamps', {
            'fields': ('unlocked_at', 'created_at', 'updated_at')
        }),
    )

    actions = ['force_unlock', 'reset_progress', 'simulate_purchases']

    def progress_bar(self, obj):
        pct = obj.progress_percentage
        color = '#4CAF50' if obj.is_unlocked else '#FF9800'
        return format_html(
            '<div style="width: 120px; height: 18px; background: #1a1a2e; '
            'border-radius: 9px; overflow: hidden; border: 1px solid #333;">'
            '<div style="width: {}%; height: 100%; background: {}; '
            'transition: width 0.3s; text-align: center; font-size: 10px; '
            'line-height: 18px; color: #fff;">{}%</div></div>',
            pct, color, pct
        )
    progress_bar.short_description = 'Progress'

    def percentage_display(self, obj):
        return f"{obj.percentage}%"
    percentage_display.short_description = 'Sales %'

    def contributor_count(self, obj):
        return len(obj.contributing_users)
    contributor_count.short_description = 'Contributors'

    @admin.action(description='🔓 Force unlock selected arcs')
    def force_unlock(self, request, queryset):
        from django.utils import timezone
        count = 0
        for progress in queryset:
            if not progress.is_unlocked:
                progress.is_unlocked = True
                progress.unlocked_at = timezone.now()
                progress.arc.is_revealed = True
                progress.arc.save(update_fields=['is_revealed'])
                progress.save(update_fields=['is_unlocked', 'unlocked_at'])
                count += 1
        self.message_user(request, f'Force unlocked {count} arc(s).')

    @admin.action(description='🔄 Reset selected progress')
    def reset_progress(self, request, queryset):
        count = queryset.update(
            current_sales=0, current_purchases=0,
            is_unlocked=False, unlocked_at=None,
            contributing_users=[], participant_count=0,
            milestone_25=False, milestone_50=False,
            milestone_75=False, milestone_90=False
        )
        self.message_user(request, f'Reset progress for {count} arc(s).')

    @admin.action(description='🧪 Simulate +10 purchases for testing')
    def simulate_purchases(self, request, queryset):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        admin_user = request.user

        for progress in queryset:
            for _ in range(10):
                progress.increment(admin_user.id, amount=1)
        self.message_user(request, f'Added 10 simulated purchases to {queryset.count()} arc(s).')


# ═════════════════════════════════════════════════════════════════
# TREASURE ADMIN
# ═════════════════════════════════════════════════════════════════

@admin.register(Treasure)
class TreasureAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'arc', 'treasure_type', 'xp_reward',
        'position_display', 'is_active', 'claim_count',
        'is_available'
    ]
    list_filter = ['treasure_type', 'is_active', 'arc']
    search_fields = ['name', 'secret_code', 'description', 'clue_text']
    list_editable = ['is_active']

    fieldsets = (
        ('Basic Info', {
            'fields': ('name', 'description', 'treasure_type', 'icon')
        }),
        ('Reward', {
            'fields': ('xp_reward', 'reward_value', 'reward_data')
        }),
        ('Position', {
            'fields': ('arc', 'map_x', 'map_y'),
            'description': 'Set position on map (0-100%)'
        }),
        ('Discovery', {
            'fields': ('clue_text', 'secret_code')
        }),
        ('Limits', {
            'fields': ('max_claims',)
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )

    def position_display(self, obj):
        return format_html(
            '<code>({}, {})</code>', obj.map_x, obj.map_y
        )
    position_display.short_description = 'Position'

    def claim_count(self, obj):
        return obj.claims.count()
    claim_count.short_description = 'Claims'


# ═════════════════════════════════════════════════════════════════
# PURCHASE LOG ADMIN
# ═════════════════════════════════════════════════════════════════

@admin.register(PurchaseLog)
class PurchaseLogAdmin(admin.ModelAdmin):
    list_display = [
        'order_id', 'user', 'amount', 'status',
        'arc_contribution', 'created_at', 'completed_at'
    ]
    list_filter = ['status', 'created_at']
    search_fields = ['order_id', 'user__username', 'user__email']
    readonly_fields = ['created_at', 'completed_at']

    actions = ['mark_completed', 'mark_failed', 'mark_refunded']

    @admin.action(description='✅ Mark selected as completed')
    def mark_completed(self, request, queryset):
        from django.utils import timezone
        count = queryset.update(status='completed', completed_at=timezone.now())
        self.message_user(request, f'Marked {count} purchase(s) as completed.')

    @admin.action(description='❌ Mark selected as failed')
    def mark_failed(self, request, queryset):
        count = queryset.update(status='failed', completed_at=None)
        self.message_user(request, f'Marked {count} purchase(s) as failed.')

    @admin.action(description='↩️ Mark selected as refunded')
    def mark_refunded(self, request, queryset):
        count = queryset.update(status='refunded', completed_at=None)
        self.message_user(request, f'Marked {count} purchase(s) as refunded.')


# ═════════════════════════════════════════════════════════════════
# CHALLENGE & REWARD ADMIN
# ═════════════════════════════════════════════════════════════════

@admin.register(Challenge)
class ChallengeAdmin(admin.ModelAdmin):
    list_display = ['title', 'arc', 'challenge_type', 'xp_reward', 'order', 'is_active']
    list_filter = ['challenge_type', 'is_active', 'arc']
    search_fields = ['title', 'description']
    list_editable = ['is_active', 'order']


@admin.register(Reward)
class RewardAdmin(admin.ModelAdmin):
    list_display = ['name', 'arc', 'reward_type', 'icon', 'discount_percentage']
    list_filter = ['reward_type']
    search_fields = ['name', 'description']


# ═════════════════════════════════════════════════════════════════
# SHIP PATH ADMIN
# ═════════════════════════════════════════════════════════════════

@admin.register(ShipPath)
class ShipPathAdmin(admin.ModelAdmin):
    list_display = ['from_arc', 'to_arc', 'path_style', 'animation_duration', 'is_active']
    list_filter = ['is_active', 'path_style']
    search_fields = ['from_arc__name', 'to_arc__name']


# ═════════════════════════════════════════════════════════════════
# TREASURE CLAIM ADMIN
# ═════════════════════════════════════════════════════════════════

@admin.register(TreasureClaim)
class TreasureClaimAdmin(admin.ModelAdmin):
    list_display = ['treasure', 'user', 'claimed_at']
    list_filter = ['claimed_at']
    search_fields = ['user__username', 'treasure__name']
    readonly_fields = ['claimed_at']


# ═════════════════════════════════════════════════════════════════
# STORY SEGMENT ADMIN
# ═════════════════════════════════════════════════════════════════

@admin.register(StorySegment)
class StorySegmentAdmin(admin.ModelAdmin):
    list_display = ['title', 'arc', 'order']
    list_filter = ['arc']
    search_fields = ['title', 'content']
    list_editable = ['order']


# ═════════════════════════════════════════════════════════════════
# LEGACY ADMIN (T-Shirt QR Hunt)
# ═════════════════════════════════════════════════════════════════

try:
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
        search_fields = ['user__username', 'user__email']
        readonly_fields = ['id', 'started_at']

        def is_completed(self, obj):
            return obj.current_level >= 5
        is_completed.boolean = True

    @admin.register(HuntReward)
    class HuntRewardAdmin(admin.ModelAdmin):
        list_display = ['user', 'level', 'coupon', 'claimed_at']
        list_filter = ['level', 'claimed_at']
        search_fields = ['user__username', 'coupon__code']

    @admin.register(HuntLeaderboard)
    class HuntLeaderboardAdmin(admin.ModelAdmin):
        list_display = ['rank', 'user', 'score', 'updated_at']
        list_filter = ['updated_at']
        search_fields = ['user__username']
        ordering = ['rank']

except Exception:
    pass  # Legacy models not available


@admin.register(MysteryCardQR)
class MysteryCardQRAdmin(admin.ModelAdmin):
    list_display = ('code', 'reward_type', 'arc_slug', 'discount_percentage', 'is_used', 'claimed_by')
    list_filter = ('reward_type', 'is_used')
    search_fields = ('code', 'arc_slug')
    readonly_fields = ('code', 'is_used', 'claimed_by', 'claimed_at')