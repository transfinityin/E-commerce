from rest_framework import permissions

class IsHuntParticipant(permissions.BasePermission):
    """Only allow access if user has activated a T-shirt QR"""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return hasattr(request.user, 'hunt_progress')

class IsAdminOrReadOnly(permissions.BasePermission):
    """Only admins can modify hunt locations"""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.role == 'admin'