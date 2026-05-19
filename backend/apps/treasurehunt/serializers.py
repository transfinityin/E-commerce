from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import (
    TShirtQRCode, HuntLocation, UserHuntProgress, 
    HuntReward, HuntLeaderboard
)

User = get_user_model()

class TShirtQRCodeSerializer(serializers.ModelSerializer):
    is_claimed = serializers.SerializerMethodField()
    claimed_by = serializers.SerializerMethodField()

    class Meta:
        model = TShirtQRCode
        fields = [
            'id', 'secret_hash', 'is_activated', 
            'is_claimed', 'claimed_by', 'activated_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_is_claimed(self, obj):
        return obj.is_activated and obj.activated_by is not None

    def get_claimed_by(self, obj):
        if obj.activated_by:
            return {
                'id': str(obj.activated_by.id),
                'name': obj.activated_by.name,
                'email': obj.activated_by.email
            }
        return None


class HuntLocationSerializer(serializers.ModelSerializer):
    distance_meters = serializers.SerializerMethodField()
    is_unlocked = serializers.SerializerMethodField()

    class Meta:
        model = HuntLocation
        fields = [
            'id', 'level', 'name', 'clue_text_tamil', 
            'clue_text_english', 'hint_image_url',
            'geo_lat', 'geo_long', 'geo_radius_meters',
            'distance_meters', 'is_unlocked', 'is_active'
        ]

    def get_distance_meters(self, obj):
        """Calculate distance from user's current GPS (passed in context)"""
        request = self.context.get('request')
        if not request:
            return None

        user_lat = request.query_params.get('lat')
        user_long = request.query_params.get('long')

        if not user_lat or not user_long:
            return None

        try:
            from geopy.distance import geodesic
            user_coords = (float(user_lat), float(user_long))
            location_coords = (float(obj.geo_lat), float(obj.geo_long))
            distance = geodesic(user_coords, location_coords).meters
            return round(distance, 1)
        except Exception:
            return None

    def get_is_unlocked(self, obj):
        """Check if this level is unlocked for current user"""
        user = self.context.get('request').user if self.context.get('request') else None
        if not user or not user.is_authenticated:
            return False

        try:
            progress = user.hunt_progress
            return obj.level <= progress.current_level + 1
        except UserHuntProgress.DoesNotExist:
            return obj.level == 1


class UserHuntProgressSerializer(serializers.ModelSerializer):
    next_location = serializers.SerializerMethodField()
    rewards_claimed = serializers.SerializerMethodField()
    time_remaining = serializers.SerializerMethodField()

    class Meta:
        model = UserHuntProgress
        fields = [
            'id', 'current_level', 'is_completed',
            'started_at', 'completed_at', 'last_unlocked_at',
            'total_time_minutes', 'next_location', 
            'rewards_claimed', 'time_remaining'
        ]

    def get_next_location(self, obj):
        if obj.next_level:
            try:
                loc = HuntLocation.objects.get(level=obj.next_level, is_active=True)
                return {
                    'level': loc.level,
                    'name': loc.name,
                    'clue_tamil': loc.clue_text_tamil,
                    'clue_english': loc.clue_text_english,
                    'hint_image': loc.hint_image_url,
                    'lat': str(loc.geo_lat),
                    'long': str(loc.geo_long)
                }
            except HuntLocation.DoesNotExist:
                return None
        return None

    def get_rewards_claimed(self, obj):
        rewards = obj.rewards.all()
        return [
            {
                'level': r.level,
                'coupon_code': r.coupon.code if r.coupon else None,
                'claimed_at': r.claimed_at
            }
            for r in rewards
        ]

    def get_time_remaining(self, obj):
        if obj.is_completed:
            return 0
        # For gamification: 48 hour limit from start
        if obj.started_at:
            elapsed = (timezone.now() - obj.started_at).total_seconds() // 60
            remaining = (48 * 60) - elapsed
            return max(0, int(remaining))
        return 48 * 60


class QRActivateSerializer(serializers.Serializer):
    """Serializer for QR code activation request"""
    code = serializers.CharField(
        max_length=64, 
        required=True,
        help_text="QR secret hash from T-shirt"
    )


class LocationVerifySerializer(serializers.Serializer):
    """Serializer for location QR verification"""
    loc_secret = serializers.CharField(
        max_length=64,
        required=True,
        help_text="Location QR secret from physical sticker"
    )
    user_lat = serializers.DecimalField(
        max_digits=10, 
        decimal_places=8,
        required=True
    )
    user_long = serializers.DecimalField(
        max_digits=11, 
        decimal_places=8,
        required=True
    )


class HuntRewardSerializer(serializers.ModelSerializer):
    coupon_details = serializers.SerializerMethodField()

    class Meta:
        model = HuntReward
        fields = ['id', 'level', 'coupon_details', 'claimed_at']

    def get_coupon_details(self, obj):
        if obj.coupon:
            return {
                'code': obj.coupon.code,
                'discount_type': obj.coupon.discount_type,
                'discount_value': str(obj.coupon.discount_value),
                'expires_at': obj.coupon.expires_at
            }
        return None


class LeaderboardSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_avatar = serializers.SerializerMethodField()
    current_level = serializers.IntegerField(source='progress.current_level', read_only=True)
    completed_at = serializers.DateTimeField(source='progress.completed_at', read_only=True)

    class Meta:
        model = HuntLeaderboard
        fields = [
            'rank', 'user_name', 'user_avatar', 
            'score', 'current_level', 'completed_at'
        ]

    def get_user_avatar(self, obj):
        # Assuming user model has avatar field - adjust as per your User model
        if hasattr(obj.user, 'avatar') and obj.user.avatar:
            return obj.user.avatar.url
        return None