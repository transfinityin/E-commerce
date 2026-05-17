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