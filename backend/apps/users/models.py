from django.db import models

# Create your models here.
import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra):
        extra.setdefault('role', 'admin')
        extra.setdefault('is_staff', True)
        extra.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra)


class User(AbstractBaseUser, PermissionsMixin):
   
    ROLE_CHOICES = [
        ('user',  'Customer'),
        ('admin', 'Admin'),
        # ('seller', 'Seller')  ← uncomment for multi-vendor upgrade
    ]

    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name       = models.CharField(max_length=150)
    username = models.CharField(max_length=150,blank=True, null=True)  # 🔥 ADD THIS
    email      = models.EmailField(unique=True)
    phone      = models.CharField(max_length=15, blank=True)
    avatar     = models.ImageField(upload_to='avatars/', blank=True, null=True)
    role       = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    is_active  = models.BooleanField(default=True)
    is_staff   = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['name']


    RANK_CHOICES = [
    ('wanderer', 'Wanderer'),      # 0
    ('founder', 'Founder'),         # 1
    ('ascendant', 'Ascendant'),    # 2
    ('phantom', 'Phantom'),        # 3
    ('eclipse', 'Eclipse'),        # 4
    ('crimson', 'Crimson'),        # 5
    ('void', 'Void'),              # 6
    ('zenith', 'Zenith'),          # 7
    ('cosmic', 'Cosmic'),          # 8
    ('shadow_war', 'Shadow War'),  # 9
    ('celestial', 'Celestial'),    # 10
    ('eternal', 'Eternal'),        # 11
]
    
    rank = models.CharField(max_length=20, choices=RANK_CHOICES, default='wanderer',db_column='user_rank')
    xp = models.PositiveIntegerField(default=0)
    unlocked_arcs = models.JSONField(default=list)  # ["wanderer", "founder"]
    
    # === ADD THESE METHODS ===
    def get_rank_index(self):
        order = [r[0] for r in self.RANK_CHOICES]
        return order.index(self.rank)
    
    def can_access_arc(self, arc_name):
        """Can user access (view) this arc - includes next arc"""
        rank_order = [r[0] for r in self.RANK_CHOICES]
        if arc_name not in rank_order:
            return False
        user_idx = rank_order.index(self.rank)
        arc_idx = rank_order.index(arc_name)
        # Can access current rank + next rank arc
        return (user_idx + 1) >= arc_idx

    def is_arc_unlocked(self, arc_name):
        rank_order = [r[0] for r in self.RANK_CHOICES]
        if arc_name not in rank_order:
            return False
        user_idx = rank_order.index(self.rank)
        arc_idx = rank_order.index(arc_name)
        # All arcs at or below user's rank are unlocked
        # founder(1) can access founder(1), wanderer(0) can access founder(1)
        return user_idx >= (arc_idx - 1)
    
    def unlock_next_rank(self):
        order = [r[0] for r in self.RANK_CHOICES]
        idx = order.index(self.rank)
        if idx < len(order) - 1:
            self.rank = order[idx + 1]
            # DON'T use .append() — reassign instead
            if self.rank not in self.unlocked_arcs:
                self.unlocked_arcs = self.unlocked_arcs + [self.rank]  # ✅ New list
            self.save()
            return self.rank
        return None
    
    def add_xp(self, amount):
        self.xp += amount
        self.save()
        return self.xp
    class Meta:
        db_table = 'users'
        ordering = ['-date_joined']

    def __str__(self):
        return f'{self.name} ({self.email})'

    @property
    def is_admin(self):
        return self.role == 'admin'


class Address(models.Model):
    id        = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user      = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    full_name = models.CharField(max_length=150)
    phone     = models.CharField(max_length=15)
    line1     = models.CharField(max_length=255)
    line2     = models.CharField(max_length=255, blank=True)
    city      = models.CharField(max_length=100)
    state     = models.CharField(max_length=100)
    pincode   = models.CharField(max_length=10)
    country   = models.CharField(max_length=100, default="India")
    latitude  = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'addresses'
        ordering = ['-is_default', '-created_at']

    def save(self, *args, **kwargs):
        # Only one default address per user
        if self.is_default:
            Address.objects.filter(user=self.user, is_default=True).update(is_default=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.full_name} — {self.city}'
    


class NotificationSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_settings')
    order_updates = models.BooleanField(default=True)
    promotional_emails = models.BooleanField(default=True)
    sms_alerts = models.BooleanField(default=False)
    push_notifications = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'notification_settings'

    def __str__(self):
        return f"{self.user.email} notifications"