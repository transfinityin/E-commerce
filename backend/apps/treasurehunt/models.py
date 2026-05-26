# import uuid
# from django.db import models
# from django.contrib.auth import get_user_model
# from django.core.validators import MinValueValidator, MaxValueValidator

# User = get_user_model()

# class TShirtQRCode(models.Model):
#     """Unique QR code generated for each T-shirt order"""
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     order = models.OneToOneField(
#         'orders.Order', 
#         on_delete=models.CASCADE, 
#         related_name='tshirt_qr',
#         help_text="Linked order that purchased the T-shirt"
#     )
#     secret_hash = models.CharField(
#         max_length=64, 
#         unique=True, 
#         db_index=True,
#         help_text="Unique secret embedded in QR code (e.g., th-xyz123abc)"
#     )
#     is_activated = models.BooleanField(default=False)
#     activated_by = models.ForeignKey(
#         User, 
#         on_delete=models.SET_NULL, 
#         null=True, 
#         blank=True,
#         related_name='activated_qrs'
#     )
#     activated_at = models.DateTimeField(null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         db_table = 'tshirt_qrcodes'
#         verbose_name = 'T-Shirt QR Code'
#         verbose_name_plural = 'T-Shirt QR Codes'
#         ordering = ['-created_at']

#     def __str__(self):
#         return f"QR-{self.secret_hash[:8]} (Order: {self.order.id})"


# class HuntLocation(models.Model):
#     """Physical locations where players scan secondary QR codes"""
#     LEVEL_CHOICES = [
#         (1, 'Level 1 - Clock Tower'),
#         (2, 'Level 2 - Marina Beach'),
#         (3, 'Level 3 - Temple Street'),
#         (4, 'Level 4 - Tech Park'),
#         (5, 'Level 5 - Final Treasure'),
#     ]

#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     level = models.PositiveSmallIntegerField(
#         choices=LEVEL_CHOICES, 
#         unique=True,
#         validators=[MinValueValidator(1), MaxValueValidator(5)]
#     )
#     name = models.CharField(max_length=100)
#     clue_text_tamil = models.TextField()
#     clue_text_english = models.TextField()
#     hint_image_url = models.URLField(blank=True, null=True)

#     # Geolocation for GPS fencing
#     geo_lat = models.DecimalField(
#         max_digits=10, 
#         decimal_places=8,
#         help_text="Latitude of the location"
#     )
#     geo_long = models.DecimalField(
#         max_digits=11, 
#         decimal_places=8,
#         help_text="Longitude of the location"
#     )
#     geo_radius_meters = models.PositiveIntegerField(
#         default=100,
#         help_text="Allowed radius in meters for GPS validation"
#     )

#     # Secondary QR at this location
#     location_qr_secret = models.CharField(
#         max_length=64, 
#         unique=True,
#         help_text="Secret code on the physical QR sticker at this location"
#     )

#     reward_coupon_template = models.ForeignKey(
#         'coupons.Coupon',
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='hunt_locations',
#         help_text="Coupon template to clone when user reaches this level"
#     )

#     is_active = models.BooleanField(default=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         db_table = 'hunt_locations'
#         verbose_name = 'Hunt Location'
#         verbose_name_plural = 'Hunt Locations'
#         ordering = ['level']

#     def __str__(self):
#         return f"Level {self.level}: {self.name}"


# class UserHuntProgress(models.Model):
#     """Tracks each user's progress through the treasure hunt"""
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     user = models.OneToOneField(
#         User, 
#         on_delete=models.CASCADE,
#         related_name='hunt_progress'
#     )
#     current_level = models.PositiveSmallIntegerField(
#         default=0,
#         validators=[MinValueValidator(0), MaxValueValidator(5)],
#         help_text="0=Not started, 1-5=Current active level, 6=Completed"
#     )
#     tshirt_qr = models.OneToOneField(
#         TShirtQRCode,
#         on_delete=models.CASCADE,
#         related_name='hunt_progress',
#         help_text="The T-shirt QR that activated this hunt"
#     )
#     started_at = models.DateTimeField(auto_now_add=True)
#     completed_at = models.DateTimeField(null=True, blank=True)
#     last_unlocked_at = models.DateTimeField(null=True, blank=True)
#     total_time_minutes = models.PositiveIntegerField(default=0, help_text="Total hunt duration")

#     class Meta:
#         db_table = 'user_hunt_progress'
#         verbose_name = 'User Hunt Progress'
#         verbose_name_plural = 'User Hunt Progress'
#         ordering = ['-started_at']

#     def __str__(self):
#         return f"{self.user.name} - Level {self.current_level}"

#     @property
#     def is_completed(self):
#         return self.current_level >= 5

#     @property
#     def next_level(self):
#         if self.current_level >= 5:
#             return None
#         return self.current_level + 1


# class HuntReward(models.Model):
#     """Individual rewards claimed at each level"""
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     user = models.ForeignKey(
#         User, 
#         on_delete=models.CASCADE,
#         related_name='hunt_rewards'
#     )
#     progress = models.ForeignKey(
#         UserHuntProgress,
#         on_delete=models.CASCADE,
#         related_name='rewards'
#     )
#     level = models.PositiveSmallIntegerField(
#         validators=[MinValueValidator(1), MaxValueValidator(5)]
#     )
#     coupon = models.ForeignKey(
#         'coupons.Coupon',
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         related_name='hunt_rewards'
#     )
#     claimed_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         db_table = 'hunt_rewards'
#         verbose_name = 'Hunt Reward'
#         verbose_name_plural = 'Hunt Rewards'
#         unique_together = ['progress', 'level']
#         ordering = ['-claimed_at']

#     def __str__(self):
#         return f"Level {self.level} Reward - {self.user.name}"


# class HuntLeaderboard(models.Model):
#     """Cached leaderboard for fast retrieval"""
#     user = models.OneToOneField(
#         User,
#         on_delete=models.CASCADE,
#         related_name='hunt_leaderboard'
#     )
#     progress = models.OneToOneField(
#         UserHuntProgress,
#         on_delete=models.CASCADE,
#         related_name='leaderboard'
#     )
#     rank = models.PositiveIntegerField(default=0)
#     score = models.PositiveIntegerField(
#         default=0,
#         help_text="Score based on levels completed and speed"
#     )
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         db_table = 'hunt_leaderboard'
#         verbose_name = 'Hunt Leaderboard'
#         verbose_name_plural = 'Hunt Leaderboard'
#         ordering = ['rank']

#     def __str__(self):
#         return f"#{self.rank} {self.user.name} ({self.score} pts)"


# """
# TRANSFINITY Treasure Hunt - Django Models
# Path: backend/apps/treasurehunt/models.py
# """
# import uuid
# from django.db import models
# from django.conf import settings
# from django.utils import timezone


# class Arc(models.Model):
#     """Each Arc = One Island on the treasure map"""
    
#     ARC_THEMES = [
#         ('founder', "Founder's Arc"),
#         ('phantom', 'Phantom Arc'),
#         ('ascension', 'Ascension Arc'),
#         ('rebirth', 'Rebirth Arc'),
#         ('eclipse', 'Eclipse Arc'),
#         ('crimson', 'Crimson Arc'),
#         ('void', 'Void Arc'),
#         ('zenith', 'Zenith Arc'),
#         ('cosmic', 'Cosmic Arc'),
#         ('shadow_war', 'Shadow War Arc'),
#         ('celestial', 'Celestial Arc'),
#         ('eternal', 'Eternal Arc'),
#     ]
    
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     arc_number = models.PositiveIntegerField(unique=True, help_text="1-12")
#     arc_key = models.CharField(max_length=20, unique=True, choices=ARC_THEMES)
#     name = models.CharField(max_length=100)
#     subtitle = models.CharField(max_length=100)
#     theme_color = models.CharField(max_length=7, default='#FFD700')
    
#     # Map positioning (percentage-based for responsive SVG)
#     map_x = models.FloatField(help_text="X position on map (0-100)")
#     map_y = models.FloatField(help_text="Y position on map (0-100)")
    
#     # Island visual
#     ISLAND_ICONS = [
#         ('island', 'Island'),
#         ('volcano', 'Volcano'),
#         ('fortress', 'Fortress'),
#         ('void', 'Void'),
#         ('castle', 'Castle'),
#         ('cosmic', 'Cosmic'),
#         ('celestial', 'Celestial'),
#         ('storm', 'Storm'),
#     ]
#     island_icon = models.CharField(max_length=50, default="island", choices=ISLAND_ICONS)
#     island_size = models.FloatField(default=1.0, help_text="Scale factor")
    
#     # Lore
#     lore_summary = models.TextField()
#     lore_full = models.TextField(blank=True)
#     hero_name = models.CharField(max_length=100, blank=True)
#     hero_description = models.TextField(blank=True)
    
#     # Unlock system
#     UNLOCK_TYPES = [
#         ('rank', 'Rank Based'),
#         ('community', 'Community Sales Target'),
#         ('time', 'Time Based'),
#         ('secret', 'Secret Hunt'),
#         ('purchase', 'Purchase Previous Arc'),
#     ]
#     unlock_type = models.CharField(max_length=20, default='rank', choices=UNLOCK_TYPES)
#     required_rank = models.CharField(max_length=20, default='wanderer')
#     sales_target = models.PositiveIntegerField(default=0, help_text="Community sales to unlock")
#     unlock_date = models.DateTimeField(null=True, blank=True)
    
#     # Status
#     is_unlocked = models.BooleanField(default=False)
#     is_revealed = models.BooleanField(default=False, help_text="Visible but locked (fog)")
    
#     # Products in this arc
#     products = models.ManyToManyField('products.Product', blank=True, related_name='arcs')
    
#     # Visual effects
#     AMBIENT_EFFECTS = [
#         ('none', 'None'),
#         ('fog', 'Fog/Mist'),
#         ('fire', 'Fire/Volcano'),
#         ('stars', 'Stars/Cosmic'),
#         ('storm', 'Storm'),
#         ('glow', 'Golden Glow'),
#         ('darkness', 'Void Darkness'),
#     ]
#     ambient_effect = models.CharField(max_length=50, default="none", choices=AMBIENT_EFFECTS)
    
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
    
#     class Meta:
#         db_table = 'arcs'
#         ordering = ['arc_number']
    
#     def __str__(self):
#         return f"Arc {self.arc_number:02d}: {self.name}"
    
#     @property
#     def display_name(self):
#         return f"ARC {self.arc_number:02d}"
    
#     @property
#     def is_active_drop(self):
#         now = timezone.now()
#         return self.products.filter(
#             is_limited_drop=True,
#             drop_start__lte=now,
#             drop_end__gte=now
#         ).exists()


# class ShipPath(models.Model):
#     """Dotted path segments between islands"""
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     from_arc = models.ForeignKey(Arc, on_delete=models.CASCADE, related_name='paths_from')
#     to_arc = models.ForeignKey(Arc, on_delete=models.CASCADE, related_name='paths_to')
    
#     path_data = models.TextField(help_text="SVG path d attribute")
    
#     animation_duration = models.FloatField(default=2.0, help_text="Seconds to travel")
#     PATH_STYLES = [
#         ('dotted', 'Dotted Line'),
#         ('dashed', 'Dashed Line'),
#         ('glowing', 'Glowing Path'),
#         ('hidden', 'Hidden/Undiscovered'),
#     ]
#     path_style = models.CharField(max_length=20, default='dotted', choices=PATH_STYLES)
    
#     is_active = models.BooleanField(default=True)
    
#     class Meta:
#         db_table = 'ship_paths'
#         unique_together = ['from_arc', 'to_arc']
    
#     def __str__(self):
#         return f"Path: {self.from_arc.name} -> {self.to_arc.name}"


# class Treasure(models.Model):
#     """Hidden treasures/clues on each island"""
    
#     TREASURE_TYPES = [
#         ('discount', 'Discount Code'),
#         ('lore', 'Lore Fragment'),
#         ('badge', 'Founder Badge'),
#         ('product', 'Secret Product'),
#         ('xp', 'XP Boost'),
#         ('rank', 'Rank Skip'),
#         ('clue', 'Next Arc Clue'),
#     ]
    
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     arc = models.ForeignKey(Arc, on_delete=models.CASCADE, related_name='treasures')
    
#     name = models.CharField(max_length=100)
#     treasure_type = models.CharField(max_length=20, choices=TREASURE_TYPES)
#     description = models.TextField()
    
#     # Hidden location on map (percentage)
#     map_x = models.FloatField()
#     map_y = models.FloatField()
    
#     # Discovery
#     clue_text = models.TextField(help_text="Hint to find this treasure")
#     secret_code = models.CharField(max_length=100, blank=True, help_text="Code to unlock")
    
#     # Reward
#     reward_value = models.CharField(max_length=200, blank=True, help_text="e.g., '20% off' or '500 XP'")
#     reward_data = models.JSONField(default=dict, blank=True)
    
#     # Status
#     is_active = models.BooleanField(default=True)
#     max_claims = models.PositiveIntegerField(default=0, help_text="0 = unlimited")
    
#     created_at = models.DateTimeField(auto_now_add=True)
    
#     class Meta:
#         db_table = 'treasures'
#         ordering = ['arc', 'name']
    
#     def __str__(self):
#         return f"Treasure: {self.name} ({self.arc.name})"
    
#     @property
#     def claim_count(self):
#         return self.claims.count()
    
#     @property
#     def is_available(self):
#         if self.max_claims == 0:
#             return self.is_active
#         return self.is_active and self.claim_count < self.max_claims


# class TreasureClaim(models.Model):
#     """User claims a treasure"""
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     treasure = models.ForeignKey(Treasure, on_delete=models.CASCADE, related_name='claims')
#     user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='treasure_claims')
#     claimed_at = models.DateTimeField(auto_now_add=True)
    
#     class Meta:
#         db_table = 'treasure_claims'
#         unique_together = ['treasure', 'user']
    
#     def __str__(self):
#         return f"{self.user.name} claimed {self.treasure.name}"


# class FounderProgress(models.Model):
#     """Tracks each user's journey through the map"""
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='founder_progress')
    
#     current_arc = models.ForeignKey(Arc, on_delete=models.SET_NULL, null=True, blank=True, related_name='current_explorers')
    
#     discovered_treasures = models.ManyToManyField(Treasure, blank=True, related_name='discovered_by')
#     visited_arcs = models.ManyToManyField(Arc, blank=True, related_name='visitors')
    
#     total_distance_traveled = models.FloatField(default=0, help_text="Total path distance")
#     secrets_found = models.PositiveIntegerField(default=0)
    
#     SCENE_CHOICES = [
#         ('map', 'World Map'),
#         ('arc', 'Arc Detail'),
#         ('treasure', 'Treasure Found'),
#         ('lore', 'Lore Discovery'),
#     ]
#     last_login_scene = models.CharField(max_length=50, default='map', choices=SCENE_CHOICES)
    
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
    
#     class Meta:
#         db_table = 'founder_progress'
    
#     def __str__(self):
#         return f"{self.user.name}'s Journey"
    
#     def visit_arc(self, arc):
#         if arc not in self.visited_arcs.all():
#             self.visited_arcs.add(arc)
#             self.user.add_xp(50)
    
#     def discover_treasure(self, treasure):
#         if treasure not in self.discovered_treasures.all():
#             self.discovered_treasures.add(treasure)
#             self.secrets_found += 1
#             self.save()
#             self.user.add_xp(200)


# class CommunityUnlockProgress(models.Model):
#     """Tracks community-wide unlock progress"""
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     arc = models.OneToOneField(Arc, on_delete=models.CASCADE, related_name='community_progress')
    
#     current_sales = models.PositiveIntegerField(default=0)
#     sales_target = models.PositiveIntegerField(default=1000)
    
#     participant_count = models.PositiveIntegerField(default=0)
    
#     is_unlocked = models.BooleanField(default=False)
#     unlocked_at = models.DateTimeField(null=True, blank=True)
    
#     milestone_25 = models.BooleanField(default=False)
#     milestone_50 = models.BooleanField(default=False)
#     milestone_75 = models.BooleanField(default=False)
#     milestone_90 = models.BooleanField(default=False)
    
#     updated_at = models.DateTimeField(auto_now=True)
    
#     class Meta:
#         db_table = 'community_unlock_progress'
    
#     def __str__(self):
#         return f"Community Progress: {self.arc.name}"
    
#     @property
#     def percentage(self):
#         if self.sales_target == 0:
#             return 100
#         return min(100, round((self.current_sales / self.sales_target) * 100, 1))
    
#     def check_milestones(self):
#         p = self.percentage
#         milestones = []
#         if p >= 25 and not self.milestone_25:
#             self.milestone_25 = True
#             milestones.append(25)
#         if p >= 50 and not self.milestone_50:
#             self.milestone_50 = True
#             milestones.append(50)
#         if p >= 75 and not self.milestone_75:
#             self.milestone_75 = True
#             milestones.append(75)
#         if p >= 90 and not self.milestone_90:
#             self.milestone_90 = True
#             milestones.append(90)
#         if milestones:
#             self.save()
#         return milestones







"""
TRANSFINITY Treasure Hunt - Integrated Django Models
Path: backend/apps/treasurehunt/models.py

Merges: Arc, ShipPath, Treasure, FounderProgress, CommunityUnlockProgress
        with enhanced fields for sound, mobile, and admin features.
"""
import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator


class Arc(models.Model):
    """Each Arc = One Island on the treasure map"""

    ARC_THEMES = [
        ('founder', "Founder's Arc"),
        ('phantom', 'Phantom Arc'),
        ('ascension', 'Ascension Arc'),
        ('rebirth', 'Rebirth Arc'),
        ('eclipse', 'Eclipse Arc'),
        ('crimson', 'Crimson Arc'),
        ('void', 'Void Arc'),
        ('zenith', 'Zenith Arc'),
        ('cosmic', 'Cosmic Arc'),
        ('shadow_war', 'Shadow War Arc'),
        ('celestial', 'Celestial Arc'),
        ('eternal', 'Eternal Arc'),
    ]

    ISLAND_ICONS = [
        ('island', 'Island'),
        ('volcano', 'Volcano'),
        ('fortress', 'Fortress'),
        ('void', 'Void'),
        ('castle', 'Castle'),
        ('cosmic', 'Cosmic'),
        ('celestial', 'Celestial'),
        ('storm', 'Storm'),
    ]

    AMBIENT_EFFECTS = [
        ('none', 'None'),
        ('fog', 'Fog/Mist'),
        ('fire', 'Fire/Volcano'),
        ('stars', 'Stars/Cosmic'),
        ('storm', 'Storm'),
        ('glow', 'Golden Glow'),
        ('darkness', 'Void Darkness'),
    ]

    UNLOCK_TYPES = [
        ('auto', 'Auto (previous completed)'),
        ('rank', 'Rank Based'),
        ('community', 'Community Sales Target'),
        ('time', 'Time Based'),
        ('secret', 'Secret Hunt'),
        ('purchase', 'Purchase Previous Arc'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    arc_number = models.PositiveIntegerField(unique=True, validators=[MinValueValidator(1), MaxValueValidator(12)])
    arc_key = models.CharField(max_length=20, unique=True, choices=ARC_THEMES)
    name = models.CharField(max_length=100)
    subtitle = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    theme_color = models.CharField(max_length=7, default='#FFD700')

    # Map positioning (percentage-based for responsive SVG)
    map_x = models.FloatField(help_text="X position on map (0-100)", validators=[MinValueValidator(0), MaxValueValidator(100)])
    map_y = models.FloatField(help_text="Y position on map (0-100)", validators=[MinValueValidator(0), MaxValueValidator(100)])

    # Island visual
    island_icon = models.CharField(max_length=50, default="island", choices=ISLAND_ICONS)
    island_size = models.FloatField(default=1.0, help_text="Scale factor", validators=[MinValueValidator(0.3), MaxValueValidator(3.0)])
    ambient_effect = models.CharField(max_length=50, default="none", choices=AMBIENT_EFFECTS)

    # Lore
    lore_summary = models.TextField(blank=True)
    lore_full = models.TextField(blank=True)
    hero_name = models.CharField(max_length=100, blank=True)
    hero_description = models.TextField(blank=True)

    # Story segments (inline in admin)
    # Related: arc.story_segments (StorySegment model)

    # Challenges (inline in admin)
    # Related: arc.challenges (Challenge model)

    # Rewards (inline in admin)
    # Related: arc.rewards (Reward model)

    # Unlock system
    unlock_type = models.CharField(max_length=20, default='auto', choices=UNLOCK_TYPES)
    required_rank = models.CharField(max_length=20, default='wanderer')
    sales_target = models.PositiveIntegerField(default=0, help_text="Community sales to unlock")
    unlock_threshold = models.PositiveIntegerField(default=0, help_text="Number of purchases needed for community unlock")
    unlock_secret_code = models.CharField(max_length=100, blank=True, help_text="Secret code to unlock this arc")
    unlock_date = models.DateTimeField(null=True, blank=True)

    # Status
    is_unlocked = models.BooleanField(default=False)
    is_revealed = models.BooleanField(default=False, help_text="Visible but locked (fog)")
    is_active = models.BooleanField(default=True)

    # Products in this arc
    products = models.ManyToManyField('products.Product', blank=True, related_name='arcs')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'arcs'
        ordering = ['arc_number']
        verbose_name = 'Arc'
        verbose_name_plural = 'Arcs'

    def __str__(self):
        return f"Arc {self.arc_number:02d}: {self.name}"

    @property
    def display_name(self):
        return f"ARC {self.arc_number:02d}"

    @property
    def is_active_drop(self):
        now = timezone.now()
        return self.products.filter(
            is_limited_drop=True,
            drop_start__lte=now,
            drop_end__gte=now
        ).exists()


class StorySegment(models.Model):
    """Story content within an arc"""
    arc = models.ForeignKey(Arc, on_delete=models.CASCADE, related_name='story_segments')
    order = models.PositiveSmallIntegerField(default=0)
    title = models.CharField(max_length=200)
    content = models.TextField()
    image = models.ImageField(upload_to='story_images/', blank=True, null=True)

    class Meta:
        db_table = 'story_segments'
        ordering = ['arc', 'order']
        verbose_name = 'Story Segment'
        verbose_name_plural = 'Story Segments'

    def __str__(self):
        return f"{self.arc.name} - {self.title}"


class Challenge(models.Model):
    """Challenges within an arc"""
    CHALLENGE_TYPES = [
        ('reflection', 'Reflection'),
        ('purchase', 'Purchase'),
        ('community', 'Community Join'),
        ('streak', 'Daily Streak'),
        ('share', 'Social Share'),
        ('secret', 'Secret Find'),
        ('quiz', 'Quiz'),
    ]

    arc = models.ForeignKey(Arc, on_delete=models.CASCADE, related_name='challenges')
    challenge_key = models.SlugField(max_length=50)
    title = models.CharField(max_length=200)
    description = models.TextField()
    challenge_type = models.CharField(max_length=20, choices=CHALLENGE_TYPES)
    xp_reward = models.PositiveIntegerField(default=100)
    icon = models.CharField(max_length=10, default='⭐')
    order = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    # For purchase-type challenges
    min_purchase_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # For streak-type challenges
    required_streak_days = models.PositiveSmallIntegerField(default=7)

    class Meta:
        db_table = 'challenges'
        ordering = ['arc', 'order']
        unique_together = ['arc', 'challenge_key']
        verbose_name = 'Challenge'
        verbose_name_plural = 'Challenges'

    def __str__(self):
        return f"{self.arc.name} - {self.title}"


class Reward(models.Model):
    """Rewards for completing arcs"""
    REWARD_TYPES = [
        ('badge', 'Badge'),
        ('theme', 'UI Theme'),
        ('xp_boost', 'XP Boost'),
        ('discount', 'Discount Code'),
        ('product', 'Product Unlock'),
        ('title', 'Title/Rank'),
    ]

    arc = models.ForeignKey(Arc, on_delete=models.CASCADE, related_name='rewards')
    name = models.CharField(max_length=100)
    reward_type = models.CharField(max_length=20, choices=REWARD_TYPES)
    description = models.TextField()
    icon = models.CharField(max_length=10, default='🎁')

    # For discount-type rewards
    discount_percentage = models.PositiveSmallIntegerField(default=0)
    discount_code = models.CharField(max_length=50, blank=True)

    # For XP boost rewards
    xp_multiplier = models.FloatField(default=1.0)
    xp_boost_duration_days = models.PositiveSmallIntegerField(default=3)

    class Meta:
        db_table = 'rewards'
        ordering = ['arc']
        verbose_name = 'Reward'
        verbose_name_plural = 'Rewards'

    def __str__(self):
        return f"{self.arc.name} - {self.name}"


class ShipPath(models.Model):
    """Dotted path segments between islands"""
    PATH_STYLES = [
        ('dotted', 'Dotted Line'),
        ('dashed', 'Dashed Line'),
        ('glowing', 'Glowing Path'),
        ('hidden', 'Hidden/Undiscovered'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    from_arc = models.ForeignKey(Arc, on_delete=models.CASCADE, related_name='paths_from')
    to_arc = models.ForeignKey(Arc, on_delete=models.CASCADE, related_name='paths_to')
    path_data = models.TextField(help_text="SVG path d attribute", blank=True)
    animation_duration = models.FloatField(default=2.0, help_text="Seconds to travel")
    path_style = models.CharField(max_length=20, default='dotted', choices=PATH_STYLES)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'ship_paths'
        unique_together = ['from_arc', 'to_arc']
        verbose_name = 'Ship Path'
        verbose_name_plural = 'Ship Paths'

    def __str__(self):
        return f"Path: {self.from_arc.name} -> {self.to_arc.name}"


class Treasure(models.Model):
    """Hidden treasures/clues on each island"""
    TREASURE_TYPES = [
        ('discount', 'Discount Code'),
        ('lore', 'Lore Fragment'),
        ('badge', 'Founder Badge'),
        ('product', 'Secret Product'),
        ('xp', 'XP Boost'),
        ('rank', 'Rank Skip'),
        ('clue', 'Next Arc Clue'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    arc = models.ForeignKey(Arc, on_delete=models.CASCADE, related_name='treasures', null=True, blank=True)
    name = models.CharField(max_length=100)
    treasure_type = models.CharField(max_length=20, choices=TREASURE_TYPES)
    description = models.TextField()

    # Hidden location on map (percentage)
    map_x = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    map_y = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(100)])

    # Discovery
    clue_text = models.TextField(help_text="Hint to find this treasure", blank=True)
    secret_code = models.CharField(max_length=100, blank=True, help_text="Code to unlock")

    # Reward
    reward_value = models.CharField(max_length=200, blank=True, help_text="e.g., '20% off' or '500 XP'")
    reward_data = models.JSONField(default=dict, blank=True)
    xp_reward = models.PositiveIntegerField(default=50)
    icon = models.CharField(max_length=10, default='💎')

    # Status
    is_active = models.BooleanField(default=True)
    max_claims = models.PositiveIntegerField(default=0, help_text="0 = unlimited")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'treasures'
        ordering = ['arc', 'name']
        verbose_name = 'Treasure'
        verbose_name_plural = 'Treasures'

    def __str__(self):
        return f"Treasure: {self.name}"

    @property
    def claim_count(self):
        return self.claims.count()

    @property
    def is_available(self):
        if self.max_claims == 0:
            return self.is_active
        return self.is_active and self.claim_count < self.max_claims


class TreasureClaim(models.Model):
    """User claims a treasure"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    treasure = models.ForeignKey(Treasure, on_delete=models.CASCADE, related_name='claims')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='treasure_claims')
    claimed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'treasure_claims'
        unique_together = ['treasure', 'user']
        verbose_name = 'Treasure Claim'
        verbose_name_plural = 'Treasure Claims'

    def __str__(self):
        return f"{self.user} claimed {self.treasure.name}"


class FounderProgress(models.Model):
    """Tracks each user's journey through the map"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='founder_progress')

    current_arc = models.ForeignKey(Arc, on_delete=models.SET_NULL, null=True, blank=True, related_name='current_explorers')

    discovered_treasures = models.ManyToManyField(Treasure, blank=True, related_name='discovered_by')
    visited_arcs = models.ManyToManyField(Arc, blank=True, related_name='visitors')

    total_distance_traveled = models.FloatField(default=0, help_text="Total path distance")
    secrets_found = models.PositiveIntegerField(default=0)

    SCENE_CHOICES = [
        ('map', 'World Map'),
        ('arc', 'Arc Detail'),
        ('treasure', 'Treasure Found'),
        ('lore', 'Lore Discovery'),
    ]
    last_login_scene = models.CharField(max_length=50, default='map', choices=SCENE_CHOICES)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'founder_progress'
        verbose_name = 'Founder Progress'
        verbose_name_plural = 'Founder Progress'

    def __str__(self):
        return f"{self.user}'s Journey"

    def visit_arc(self, arc):
        if arc not in self.visited_arcs.all():
            self.visited_arcs.add(arc)
            # Award XP via user model method if available
            if hasattr(self.user, 'add_xp'):
                self.user.add_xp(50)

    def discover_treasure(self, treasure):
        if treasure not in self.discovered_treasures.all():
            self.discovered_treasures.add(treasure)
            self.secrets_found += 1
            self.save(update_fields=['secrets_found'])
            if hasattr(self.user, 'add_xp'):
                self.user.add_xp(200)


class CommunityUnlockProgress(models.Model):
    """Tracks community-wide unlock progress for purchase-gated arcs"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    arc = models.OneToOneField(
        Arc, 
        on_delete=models.CASCADE, 
        related_name='community_progress',
        limit_choices_to={'unlock_type': 'community'}
    )

    current_sales = models.PositiveIntegerField(default=0)
    sales_target = models.PositiveIntegerField(default=1000)
    current_purchases = models.PositiveIntegerField(default=0)
    target_purchases = models.PositiveIntegerField(default=100)

    participant_count = models.PositiveIntegerField(default=0)
    contributing_users = models.JSONField(default=list, help_text="List of user IDs who contributed")

    is_unlocked = models.BooleanField(default=False)
    unlocked_at = models.DateTimeField(null=True, blank=True)

    milestone_25 = models.BooleanField(default=False)
    milestone_50 = models.BooleanField(default=False)
    milestone_75 = models.BooleanField(default=False)
    milestone_90 = models.BooleanField(default=False)

    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'community_unlock_progress'
        verbose_name = 'Community Unlock Progress'
        verbose_name_plural = 'Community Unlock Progress'

    def __str__(self):
        return f"Community Progress: {self.arc.name}"

    @property
    def percentage(self):
        if self.sales_target == 0:
            return 100
        return min(100, round((self.current_sales / self.sales_target) * 100, 1))

    @property
    def progress_percentage(self):
        if self.target_purchases == 0:
            return 100
        return min(100, int((self.current_purchases / self.target_purchases) * 100))

    def check_milestones(self):
        p = self.percentage
        milestones = []
        if p >= 25 and not self.milestone_25:
            self.milestone_25 = True
            milestones.append(25)
        if p >= 50 and not self.milestone_50:
            self.milestone_50 = True
            milestones.append(50)
        if p >= 75 and not self.milestone_75:
            self.milestone_75 = True
            milestones.append(75)
        if p >= 90 and not self.milestone_90:
            self.milestone_90 = True
            milestones.append(90)
        if milestones:
            self.save()
        return milestones

    def increment(self, user_id, amount=1):
        """Increment progress and check if unlock threshold reached"""
        self.current_purchases += amount

        # Track unique contributing users
        contributors = list(self.contributing_users)
        if user_id not in contributors:
            contributors.append(user_id)
            self.contributing_users = contributors

        # Check if threshold reached
        if not self.is_unlocked and self.current_purchases >= self.target_purchases:
            self.is_unlocked = True
            self.unlocked_at = timezone.now()
            # Reveal the arc
            self.arc.is_revealed = True
            self.arc.save(update_fields=['is_revealed'])

        self.save(update_fields=['current_purchases', 'contributing_users', 'is_unlocked', 'unlocked_at'])
        return self.is_unlocked


class PurchaseLog(models.Model):
    """Log of purchases for signal processing"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='transfinity_purchases')
    order_id = models.CharField(max_length=100, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    items = models.JSONField(default=list)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    arc_contribution = models.ForeignKey(
        CommunityUnlockProgress,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='purchases'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'purchase_logs'
        ordering = ['-created_at']
        verbose_name = 'Purchase Log'
        verbose_name_plural = 'Purchase Logs'

    def __str__(self):
        return f"Purchase {self.order_id} - {self.status}"


# Legacy model stubs for backward compatibility
try:
    from django.contrib.auth import get_user_model
    User = get_user_model()

    class TShirtQRCode(models.Model):
        """Legacy: Unique QR code for T-shirt orders"""
        id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
        order = models.OneToOneField('orders.Order', on_delete=models.CASCADE, related_name='tshirt_qr')
        secret_hash = models.CharField(max_length=64, unique=True, db_index=True)
        is_activated = models.BooleanField(default=False)
        activated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='activated_qrs')
        activated_at = models.DateTimeField(null=True, blank=True)
        created_at = models.DateTimeField(auto_now_add=True)

        class Meta:
            db_table = 'tshirt_qrcodes'

    class HuntLocation(models.Model):
        """Legacy: Physical locations for QR hunt"""
        id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
        level = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
        name = models.CharField(max_length=100)
        clue_text_tamil = models.TextField()
        clue_text_english = models.TextField()
        hint_image_url = models.URLField(blank=True, null=True)
        geo_lat = models.DecimalField(max_digits=10, decimal_places=8)
        geo_long = models.DecimalField(max_digits=11, decimal_places=8)
        geo_radius_meters = models.PositiveIntegerField(default=100)
        location_qr_secret = models.CharField(max_length=64, unique=True)
        is_active = models.BooleanField(default=True)
        created_at = models.DateTimeField(auto_now_add=True)

        class Meta:
            db_table = 'hunt_locations'

    class UserHuntProgress(models.Model):
        """Legacy: Physical hunt progress"""
        id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
        user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='hunt_progress')
        current_level = models.PositiveSmallIntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])
        tshirt_qr = models.OneToOneField(TShirtQRCode, on_delete=models.CASCADE, related_name='hunt_progress', null=True, blank=True)
        started_at = models.DateTimeField(auto_now_add=True)
        completed_at = models.DateTimeField(null=True, blank=True)
        last_unlocked_at = models.DateTimeField(null=True, blank=True)
        total_time_minutes = models.PositiveIntegerField(default=0)
        unlocked_arcs = models.JSONField(default=list)

        class Meta:
            db_table = 'user_hunt_progress'

    class HuntReward(models.Model):
        """Legacy: Physical hunt rewards"""
        id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
        user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='hunt_rewards')
        progress = models.ForeignKey(UserHuntProgress, on_delete=models.CASCADE, related_name='rewards')
        level = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
        coupon = models.ForeignKey('coupons.Coupon', on_delete=models.SET_NULL, null=True, blank=True)
        claimed_at = models.DateTimeField(auto_now_add=True)

        class Meta:
            db_table = 'hunt_rewards'
            unique_together = ['progress', 'level']

    class HuntLeaderboard(models.Model):
        """Legacy: Physical hunt leaderboard"""
        user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='hunt_leaderboard')
        progress = models.OneToOneField(UserHuntProgress, on_delete=models.CASCADE, related_name='leaderboard')
        rank = models.PositiveIntegerField(default=0)
        score = models.PositiveIntegerField(default=0)
        updated_at = models.DateTimeField(auto_now=True)

        class Meta:
            db_table = 'hunt_leaderboard'

except Exception:
    pass  # Legacy models not available if orders/coupons apps don't exist



import secrets
from django.utils import timezone

class MysteryCardQR(models.Model):
    REWARD_CHOICES = (
        ('arc', 'Unlock Story Arc'),
        ('coupon', 'Discount Coupon'),
    )
    
    # myst-abcd123 mathiri code generate aagum
    code = models.CharField(max_length=50, unique=True, blank=True)
    
    # Admin select pandra type
    reward_type = models.CharField(max_length=10, choices=REWARD_CHOICES)
    
    # Arc select panna intha field-la peru type pannanum (e.g., wanderer)
    arc_slug = models.CharField(max_length=50, blank=True, null=True, help_text="Example: wanderer, founderer")
    
    # Coupon select panna intha field-la discount podanum (e.g., 15.00)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    
    # Tracking fields
    is_used = models.BooleanField(default=False)
    claimed_by = models.ForeignKey('users.User', null=True, blank=True, on_delete=models.SET_NULL)
    claimed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Auto-generate 'myst-' code if it doesn't exist
        if not self.code:
            self.code = f"myst-{secrets.token_urlsafe(6)[:8].lower()}"
        super().save(*args, **kwargs)

    def __str__(self):
        status = "Used" if self.is_used else "Active"
        if self.reward_type == 'arc':
            return f"{self.code} - Arc: {self.arc_slug} ({status})"
        return f"{self.code} - Coupon: {self.discount_percentage}% ({status})"