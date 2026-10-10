from rest_framework.permissions import BasePermission


def user_is_super_admin(user) -> bool:
    """True only for authenticated Django superusers (createsuperuser / is_superuser)."""
    return bool(
        user
        and getattr(user, "is_authenticated", False)
        and getattr(user, "is_active", True)
        and getattr(user, "is_superuser", False)
    )


class IsAdmin(BasePermission):
    """Admin API access — super admin only."""

    def has_permission(self, request, view):
        return user_is_super_admin(request.user)


class IsSuperAdmin(IsAdmin):
    """Alias for clarity in views."""

    pass


class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if user_is_super_admin(request.user):
            return True
        owner = getattr(obj, "user", None)
        return owner == request.user


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True
        return user_is_super_admin(request.user)
