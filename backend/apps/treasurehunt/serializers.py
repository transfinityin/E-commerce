# from rest_framework import serializers
# from django.contrib.auth import get_user_model
# from django.utils import timezone
# from .models import (
#     TShirtQRCode, HuntLocation, UserHuntProgress, 
#     HuntReward, HuntLeaderboard
# )

# User = get_user_model()

# class TShirtQRCodeSerializer(serializers.ModelSerializer):
#     is_claimed = serializers.SerializerMethodField()
#     claimed_by = serializers.SerializerMethodField()

#     class Meta:
#         model = TShirtQRCode
#         fields = [
#             'id', 'secret_hash', 'is_activated', 
#             'is_claimed', 'claimed_by', 'activated_at', 'created_at'
#         ]
#         read_only_fields = ['id', 'created_at']

#     def get_is_claimed(self, obj):
#         return obj.is_activated and obj.activated_by is not None

#     def get_claimed_by(self, obj):
#         if obj.activated_by:
#             return {
#                 'id': str(obj.activated_by.id),
#                 'name': obj.activated_by.name,
#                 'email': obj.activated_by.email
#             }
#         return None


# class HuntLocationSerializer(serializers.ModelSerializer):
#     distance_meters = serializers.SerializerMethodField()
#     is_unlocked = serializers.SerializerMethodField()

#     class Meta:
#         model = HuntLocation
#         fields = [
#             'id', 'level', 'name', 'clue_text_tamil', 
#             'clue_text_english', 'hint_image_url',
#             'geo_lat', 'geo_long', 'geo_radius_meters',
#             'distance_meters', 'is_unlocked', 'is_active'
#         ]

#     def get_distance_meters(self, obj):
#         """Calculate distance from user's current GPS (passed in context)"""
#         request = self.context.get('request')
#         if not request:
#             return None

#         user_lat = request.query_params.get('lat')
#         user_long = request.query_params.get('long')

#         if not user_lat or not user_long:
#             return None

#         try:
#             from geopy.distance import geodesic
#             user_coords = (float(user_lat), float(user_long))
#             location_coords = (float(obj.geo_lat), float(obj.geo_long))
#             distance = geodesic(user_coords, location_coords).meters
#             return round(distance, 1)
#         except Exception:
#             return None

#     def get_is_unlocked(self, obj):
#         """Check if this level is unlocked for current user"""
#         user = self.context.get('request').user if self.context.get('request') else None
#         if not user or not user.is_authenticated:
#             return False

#         try:
#             progress = user.hunt_progress
#             return obj.level <= progress.current_level + 1
#         except UserHuntProgress.DoesNotExist:
#             return obj.level == 1


# class UserHuntProgressSerializer(serializers.ModelSerializer):
#     next_location = serializers.SerializerMethodField()
#     rewards_claimed = serializers.SerializerMethodField()
#     time_remaining = serializers.SerializerMethodField()

#     class Meta:
#         model = UserHuntProgress
#         fields = [
#             'id', 'current_level', 'is_completed',
#             'started_at', 'completed_at', 'last_unlocked_at',
#             'total_time_minutes', 'next_location', 
#             'rewards_claimed', 'time_remaining'
#         ]

#     def get_next_location(self, obj):
#         if obj.next_level:
#             try:
#                 loc = HuntLocation.objects.get(level=obj.next_level, is_active=True)
#                 return {
#                     'level': loc.level,
#                     'name': loc.name,
#                     'clue_tamil': loc.clue_text_tamil,
#                     'clue_english': loc.clue_text_english,
#                     'hint_image': loc.hint_image_url,
#                     'lat': str(loc.geo_lat),
#                     'long': str(loc.geo_long)
#                 }
#             except HuntLocation.DoesNotExist:
#                 return None
#         return None

#     def get_rewards_claimed(self, obj):
#         rewards = obj.rewards.all()
#         return [
#             {
#                 'level': r.level,
#                 'coupon_code': r.coupon.code if r.coupon else None,
#                 'claimed_at': r.claimed_at
#             }
#             for r in rewards
#         ]

#     def get_time_remaining(self, obj):
#         if obj.is_completed:
#             return 0
#         # For gamification: 48 hour limit from start
#         if obj.started_at:
#             elapsed = (timezone.now() - obj.started_at).total_seconds() // 60
#             remaining = (48 * 60) - elapsed
#             return max(0, int(remaining))
#         return 48 * 60


# class QRActivateSerializer(serializers.Serializer):
#     """Serializer for QR code activation request"""
#     code = serializers.CharField(
#         max_length=64, 
#         required=True,
#         help_text="QR secret hash from T-shirt"
#     )


# class LocationVerifySerializer(serializers.Serializer):
#     """Serializer for location QR verification"""
#     loc_secret = serializers.CharField(
#         max_length=64,
#         required=True,
#         help_text="Location QR secret from physical sticker"
#     )
#     user_lat = serializers.DecimalField(
#         max_digits=10, 
#         decimal_places=8,
#         required=True
#     )
#     user_long = serializers.DecimalField(
#         max_digits=11, 
#         decimal_places=8,
#         required=True
#     )


# class HuntRewardSerializer(serializers.ModelSerializer):
#     coupon_details = serializers.SerializerMethodField()

#     class Meta:
#         model = HuntReward
#         fields = ['id', 'level', 'coupon_details', 'claimed_at']

#     def get_coupon_details(self, obj):
#         if obj.coupon:
#             return {
#                 'code': obj.coupon.code,
#                 'discount_type': obj.coupon.discount_type,
#                 'discount_value': str(obj.coupon.discount_value),
#                 'expires_at': obj.coupon.expires_at
#             }
#         return None


# class LeaderboardSerializer(serializers.ModelSerializer):
#     user_name = serializers.CharField(source='user.name', read_only=True)
#     user_avatar = serializers.SerializerMethodField()
#     current_level = serializers.IntegerField(source='progress.current_level', read_only=True)
#     completed_at = serializers.DateTimeField(source='progress.completed_at', read_only=True)

#     class Meta:
#         model = HuntLeaderboard
#         fields = [
#             'rank', 'user_name', 'user_avatar', 
#             'score', 'current_level', 'completed_at'
#         ]

#     def get_user_avatar(self, obj):
#         # Assuming user model has avatar field - adjust as per your User model
#         if hasattr(obj.user, 'avatar') and obj.user.avatar:
#             return obj.user.avatar.url
#         return None

# """
# TRANSFINITY Treasure Hunt - Django REST Serializers
# Path: backend/apps/treasurehunt/serializers.py
# """
# from rest_framework import serializers
# from .models import Arc, ShipPath, Treasure, TreasureClaim, FounderProgress


# class ArcSerializer(serializers.ModelSerializer):
#     status = serializers.SerializerMethodField()
#     products_count = serializers.SerializerMethodField()
    
#     class Meta:
#         model = Arc
#         fields = [
#             'id', 'arc_number', 'arc_key', 'name', 'subtitle', 
#             'theme_color', 'map_x', 'map_y', 'island_icon', 'island_size',
#             'lore_summary', 'hero_name', 'ambient_effect',
#             'is_unlocked', 'is_revealed', 'status',
#             'products_count', 'unlock_type'
#         ]
    
#     def get_status(self, obj):
#         request = self.context.get('request')
#         if request and request.user.is_authenticated:
#             user = request.user
#             if hasattr(user, 'is_arc_unlocked') and user.is_arc_unlocked(obj.arc_key):
#                 return 'unlocked'
#             elif obj.is_revealed:
#                 return 'locked'
#             else:
#                 return 'hidden'
#         return 'locked' if obj.is_revealed else 'hidden'
    
#     def get_products_count(self, obj):
#         return obj.products.filter(is_active=True).count()


# class ArcDetailSerializer(ArcSerializer):
#     lore_full = serializers.CharField()
#     hero_description = serializers.CharField()
#     treasures = serializers.SerializerMethodField()
#     community_progress = serializers.SerializerMethodField()
    
#     class Meta(ArcSerializer.Meta):
#         fields = ArcSerializer.Meta.fields + [
#             'lore_full', 'hero_description', 'treasures', 
#             'community_progress', 'required_rank', 'sales_target'
#         ]
    
#     def get_treasures(self, obj):
#         request = self.context.get('request')
#         treasures = obj.treasures.filter(is_active=True)
        
#         if request and request.user.is_authenticated:
#             try:
#                 discovered = request.user.founder_progress.discovered_treasures.values_list('id', flat=True)
#                 discovered_ids = [str(d) for d in discovered]
#             except:
#                 discovered_ids = []
            
#             return [
#                 {
#                     'id': str(t.id),
#                     'name': t.name,
#                     'treasure_type': t.treasure_type,
#                     'map_x': t.map_x,
#                     'map_y': t.map_y,
#                     'is_discovered': str(t.id) in discovered_ids,
#                     'clue_text': t.clue_text if str(t.id) in discovered_ids else None,
#                 }
#                 for t in treasures
#             ]
#         return []
    
#     def get_community_progress(self, obj):
#         try:
#             cp = obj.community_progress
#             return {
#                 'percentage': cp.percentage,
#                 'current_sales': cp.current_sales,
#                 'target': cp.sales_target,
#                 'participants': cp.participant_count,
#             }
#         except:
#             return None


# class ShipPathSerializer(serializers.ModelSerializer):
#     from_arc_number = serializers.IntegerField(source='from_arc.arc_number', read_only=True)
#     to_arc_number = serializers.IntegerField(source='to_arc.arc_number', read_only=True)
    
#     class Meta:
#         model = ShipPath
#         fields = ['id', 'from_arc', 'to_arc', 'from_arc_number', 'to_arc_number',
#                   'path_data', 'animation_duration', 'path_style', 'is_active']


# class TreasureClaimSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = TreasureClaim
#         fields = ['treasure', 'claimed_at']
#         read_only_fields = ['claimed_at']


# class FounderProgressSerializer(serializers.ModelSerializer):
#     visited_arcs = ArcSerializer(many=True, read_only=True)
#     discovered_treasures = serializers.SerializerMethodField()
    
#     class Meta:
#         model = FounderProgress
#         fields = ['current_arc', 'visited_arcs', 'discovered_treasures', 
#                   'total_distance_traveled', 'secrets_found']
    
#     def get_discovered_treasures(self, obj):
#         return [
#             {
#                 'id': str(t.id),
#                 'name': t.name,
#                 'arc': t.arc.name,
#                 'type': t.treasure_type,
#             }
#             for t in obj.discovered_treasures.all()
#         ]





"""
TRANSFINITY Treasure Hunt - Integrated Serializers
Path: backend/apps/treasurehunt/serializers.py
"""
from rest_framework import serializers
from .models import (
    Arc, StorySegment, Challenge, Reward, ShipPath,
    Treasure, TreasureClaim, FounderProgress,
    CommunityUnlockProgress, PurchaseLog,
    TShirtQRCode, HuntLocation, UserHuntProgress,
    HuntReward, HuntLeaderboard,
)


class StorySegmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = StorySegment
        fields = ['id', 'order', 'title', 'content', 'image']


class ChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Challenge
        fields = [
            'id', 'challenge_key', 'title', 'description',
            'challenge_type', 'xp_reward', 'icon', 'order', 'is_active'
        ]


class RewardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reward
        fields = ['id', 'name', 'reward_type', 'description', 'icon']


class ArcSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    products_count = serializers.SerializerMethodField()

    class Meta:
        model = Arc
        fields = [
            'id', 'arc_number', 'arc_key', 'name', 'subtitle',
            'theme_color', 'map_x', 'map_y', 'island_icon', 'island_size',
            'lore_summary', 'hero_name', 'ambient_effect',
            'is_unlocked', 'is_revealed', 'status',
            'products_count', 'unlock_type'
        ]

    def get_status(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            user = request.user
            if hasattr(user, 'is_arc_unlocked') and user.is_arc_unlocked(obj.arc_key):
                return 'unlocked'
            elif hasattr(user, 'founder_progress'):
                if obj in user.founder_progress.visited_arcs.all():
                    return 'unlocked'
            if obj.is_revealed:
                return 'locked'
            return 'hidden'
        return 'locked' if obj.is_revealed else 'hidden'

    def get_products_count(self, obj):
        return obj.products.filter(is_active=True).count()


class ArcDetailSerializer(ArcSerializer):
    story_segments = StorySegmentSerializer(many=True, read_only=True)
    challenges = ChallengeSerializer(many=True, read_only=True)
    rewards = RewardSerializer(many=True, read_only=True)
    lore_full = serializers.CharField()
    hero_description = serializers.CharField()
    community_progress = serializers.SerializerMethodField()

    class Meta(ArcSerializer.Meta):
        fields = ArcSerializer.Meta.fields + [
            'lore_full', 'hero_description', 'story_segments',
            'challenges', 'rewards', 'community_progress',
            'required_rank', 'sales_target', 'unlock_threshold'
        ]

    def get_community_progress(self, obj):
        try:
            cp = obj.community_progress
            return {
                'percentage': cp.percentage,
                'progress_percentage': cp.progress_percentage,
                'current_sales': cp.current_sales,
                'sales_target': cp.sales_target,
                'current_purchases': cp.current_purchases,
                'target_purchases': cp.target_purchases,
                'participants': cp.participant_count,
                'contributors': len(cp.contributing_users),
                'is_unlocked': cp.is_unlocked,
                'milestones': {
                    '25': cp.milestone_25,
                    '50': cp.milestone_50,
                    '75': cp.milestone_75,
                    '90': cp.milestone_90,
                }
            }
        except Exception:
            return None


class ShipPathSerializer(serializers.ModelSerializer):
    from_arc_number = serializers.IntegerField(source='from_arc.arc_number', read_only=True)
    to_arc_number = serializers.IntegerField(source='to_arc.arc_number', read_only=True)
    from_arc_name = serializers.CharField(source='from_arc.name', read_only=True)
    to_arc_name = serializers.CharField(source='to_arc.name', read_only=True)

    class Meta:
        model = ShipPath
        fields = [
            'id', 'from_arc', 'to_arc',
            'from_arc_number', 'to_arc_number',
            'from_arc_name', 'to_arc_name',
            'path_data', 'animation_duration', 'path_style', 'is_active'
        ]


class TreasureSerializer(serializers.ModelSerializer):
    is_claimed = serializers.SerializerMethodField()
    claim_count = serializers.ReadOnlyField()

    class Meta:
        model = Treasure
        fields = [
            'id', 'name', 'treasure_type', 'description',
            'map_x', 'map_y', 'xp_reward', 'icon',
            'reward_value', 'is_active', 'is_available',
            'is_claimed', 'claim_count'
        ]

    def get_is_claimed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return TreasureClaim.objects.filter(treasure=obj, user=request.user).exists()
        return False


class TreasureClaimSerializer(serializers.ModelSerializer):
    treasure_name = serializers.CharField(source='treasure.name', read_only=True)

    class Meta:
        model = TreasureClaim
        fields = ['treasure', 'treasure_name', 'claimed_at']
        read_only_fields = ['claimed_at']


class FounderProgressSerializer(serializers.ModelSerializer):
    visited_arcs = ArcSerializer(many=True, read_only=True)
    discovered_treasures = serializers.SerializerMethodField()
    current_arc_number = serializers.SerializerMethodField()

    class Meta:
        model = FounderProgress
        fields = [
            'current_arc', 'current_arc_number', 'visited_arcs',
            'discovered_treasures', 'total_distance_traveled',
            'secrets_found', 'last_login_scene'
        ]

    def get_discovered_treasures(self, obj):
        return [
            {
                'id': str(t.id),
                'name': t.name,
                'arc': t.arc.name if t.arc else None,
                'type': t.treasure_type,
                'xp_reward': t.xp_reward,
            }
            for t in obj.discovered_treasures.all()
        ]

    def get_current_arc_number(self, obj):
        return obj.current_arc.arc_number if obj.current_arc else 1


class CommunityProgressSerializer(serializers.ModelSerializer):
    arc_name = serializers.CharField(source='arc.name', read_only=True)
    arc_number = serializers.IntegerField(source='arc.arc_number', read_only=True)
    arc_key = serializers.CharField(source='arc.arc_key', read_only=True)
    progress_percentage = serializers.ReadOnlyField()
    percentage = serializers.ReadOnlyField()
    contributor_count = serializers.SerializerMethodField()

    class Meta:
        model = CommunityUnlockProgress
        fields = [
            'id', 'arc', 'arc_name', 'arc_number', 'arc_key',
            'current_sales', 'sales_target',
            'current_purchases', 'target_purchases',
            'percentage', 'progress_percentage',
            'is_unlocked', 'unlocked_at',
            'participant_count', 'contributor_count',
            'milestone_25', 'milestone_50', 'milestone_75', 'milestone_90'
        ]

    def get_contributor_count(self, obj):
        return len(obj.contributing_users)


class PurchaseLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    arc_name = serializers.CharField(source='arc_contribution.arc.name', read_only=True)

    class Meta:
        model = PurchaseLog
        fields = [
            'id', 'order_id', 'user', 'username', 'amount',
            'status', 'items', 'arc_contribution', 'arc_name',
            'created_at', 'completed_at'
        ]


# Legacy Serializers
class QRActivateSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=64, required=True)

class HuntLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = HuntLocation
        fields = [
            'id', 'level', 'name', 'clue_text_tamil', 'clue_text_english',
            'hint_image_url', 'geo_lat', 'geo_long', 'geo_radius_meters',
            'location_qr_secret', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class UserHuntProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserHuntProgress
        fields = [
            'id', 'current_level', 'started_at',
            'completed_at', 'last_unlocked_at'
        ]


class HuntRewardSerializer(serializers.ModelSerializer):
    class Meta:
        model = HuntReward
        fields = ['id', 'level', 'claimed_at']


class LeaderboardSerializer(serializers.ModelSerializer):
    class Meta:
        model = HuntLeaderboard
        fields = ['rank', 'score', 'updated_at']




class UserHuntProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserHuntProgress
        # Intha fields list-la 'unlocked_arcs' add pannanum
        fields = ['id', 'user', 'current_level', 'total_score', 'unlocked_arcs', 'last_scan_time']