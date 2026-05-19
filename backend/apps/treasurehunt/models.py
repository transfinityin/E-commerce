import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()

class TShirtQRCode(models.Model):
    """Unique QR code generated for each T-shirt order"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.OneToOneField(
        'orders.Order', 
        on_delete=models.CASCADE, 
        related_name='tshirt_qr',
        help_text="Linked order that purchased the T-shirt"
    )
    secret_hash = models.CharField(
        max_length=64, 
        unique=True, 
        db_index=True,
        help_text="Unique secret embedded in QR code (e.g., th-xyz123abc)"
    )
    is_activated = models.BooleanField(default=False)
    activated_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='activated_qrs'
    )
    activated_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'tshirt_qrcodes'
        verbose_name = 'T-Shirt QR Code'
        verbose_name_plural = 'T-Shirt QR Codes'
        ordering = ['-created_at']

    def __str__(self):
        return f"QR-{self.secret_hash[:8]} (Order: {self.order.id})"


class HuntLocation(models.Model):
    """Physical locations where players scan secondary QR codes"""
    LEVEL_CHOICES = [
        (1, 'Level 1 - Clock Tower'),
        (2, 'Level 2 - Marina Beach'),
        (3, 'Level 3 - Temple Street'),
        (4, 'Level 4 - Tech Park'),
        (5, 'Level 5 - Final Treasure'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    level = models.PositiveSmallIntegerField(
        choices=LEVEL_CHOICES, 
        unique=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    name = models.CharField(max_length=100)
    clue_text_tamil = models.TextField()
    clue_text_english = models.TextField()
    hint_image_url = models.URLField(blank=True, null=True)

    # Geolocation for GPS fencing
    geo_lat = models.DecimalField(
        max_digits=10, 
        decimal_places=8,
        help_text="Latitude of the location"
    )
    geo_long = models.DecimalField(
        max_digits=11, 
        decimal_places=8,
        help_text="Longitude of the location"
    )
    geo_radius_meters = models.PositiveIntegerField(
        default=100,
        help_text="Allowed radius in meters for GPS validation"
    )

    # Secondary QR at this location
    location_qr_secret = models.CharField(
        max_length=64, 
        unique=True,
        help_text="Secret code on the physical QR sticker at this location"
    )

    reward_coupon_template = models.ForeignKey(
        'coupons.Coupon',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='hunt_locations',
        help_text="Coupon template to clone when user reaches this level"
    )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'hunt_locations'
        verbose_name = 'Hunt Location'
        verbose_name_plural = 'Hunt Locations'
        ordering = ['level']

    def __str__(self):
        return f"Level {self.level}: {self.name}"


class UserHuntProgress(models.Model):
    """Tracks each user's progress through the treasure hunt"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE,
        related_name='hunt_progress'
    )
    current_level = models.PositiveSmallIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        help_text="0=Not started, 1-5=Current active level, 6=Completed"
    )
    tshirt_qr = models.OneToOneField(
        TShirtQRCode,
        on_delete=models.CASCADE,
        related_name='hunt_progress',
        help_text="The T-shirt QR that activated this hunt"
    )
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_unlocked_at = models.DateTimeField(null=True, blank=True)
    total_time_minutes = models.PositiveIntegerField(default=0, help_text="Total hunt duration")

    class Meta:
        db_table = 'user_hunt_progress'
        verbose_name = 'User Hunt Progress'
        verbose_name_plural = 'User Hunt Progress'
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.user.name} - Level {self.current_level}"

    @property
    def is_completed(self):
        return self.current_level >= 5

    @property
    def next_level(self):
        if self.current_level >= 5:
            return None
        return self.current_level + 1


class HuntReward(models.Model):
    """Individual rewards claimed at each level"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='hunt_rewards'
    )
    progress = models.ForeignKey(
        UserHuntProgress,
        on_delete=models.CASCADE,
        related_name='rewards'
    )
    level = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    coupon = models.ForeignKey(
        'coupons.Coupon',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='hunt_rewards'
    )
    claimed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'hunt_rewards'
        verbose_name = 'Hunt Reward'
        verbose_name_plural = 'Hunt Rewards'
        unique_together = ['progress', 'level']
        ordering = ['-claimed_at']

    def __str__(self):
        return f"Level {self.level} Reward - {self.user.name}"


class HuntLeaderboard(models.Model):
    """Cached leaderboard for fast retrieval"""
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='hunt_leaderboard'
    )
    progress = models.OneToOneField(
        UserHuntProgress,
        on_delete=models.CASCADE,
        related_name='leaderboard'
    )
    rank = models.PositiveIntegerField(default=0)
    score = models.PositiveIntegerField(
        default=0,
        help_text="Score based on levels completed and speed"
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'hunt_leaderboard'
        verbose_name = 'Hunt Leaderboard'
        verbose_name_plural = 'Hunt Leaderboard'
        ordering = ['rank']

    def __str__(self):
        return f"#{self.rank} {self.user.name} ({self.score} pts)"