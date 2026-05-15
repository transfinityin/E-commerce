from django.contrib import admin
from apps.users.models import User, Address

from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

# Register your models here.

# ── Users ─────────────────────────────────────────────────────
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display  = ('email', 'name', 'role', 'is_active', 'date_joined')
    list_filter   = ('role', 'is_active', 'is_staff')
    search_fields = ('email', 'name', 'phone')
    ordering      = ('-date_joined',)
    fieldsets = (
        (None,           {'fields': ('email', 'password')}),
        ('Personal info',{'fields': ('name', 'phone', 'avatar')}),
        ('Permissions',  {'fields': ('role', 'is_active', 'is_staff', 'is_superuser',
                                     'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {'classes': ('wide',),
                'fields':  ('email', 'name', 'password1', 'password2', 'role')}),
    )
 
 
@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display  = ('user', 'full_name', 'city', 'state', 'pincode', 'is_default')
    list_filter   = ('state', 'is_default')
    search_fields = ('user__email', 'full_name', 'city')
 