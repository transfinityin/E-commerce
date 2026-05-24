# from rest_framework import permissions

# class IsHuntParticipant(permissions.BasePermission):
#     """Only allow access if user has activated a T-shirt QR"""

#     def has_permission(self, request, view):
#         if not request.user or not request.user.is_authenticated:
#             return False
#         return hasattr(request.user, 'hunt_progress')

# class IsAdminOrReadOnly(permissions.BasePermission):
#     """Only admins can modify hunt locations"""

#     def has_permission(self, request, view):
#         if request.method in permissions.SAFE_METHODS:
#             return True
#         return request.user and request.user.is_authenticated and request.user.role == 'admin'

from rest_framework import permissions

class IsHuntParticipant(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return hasattr(request.user, 'hunt_progress')

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and (
            getattr(request.user, 'role', '') == 'admin' or request.user.is_staff
        )

class IsArcUnlocked(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        if getattr(obj, 'arc_number', 0) == 1:
            return True
        if hasattr(request.user, 'is_arc_unlocked'):
            return request.user.is_arc_unlocked(obj.arc_key)
        if hasattr(request.user, 'founder_progress'):
            return obj in request.user.founder_progress.visited_arcs.all()
        return False










