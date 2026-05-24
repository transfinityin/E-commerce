# # from django.urls import path
# # from . import views

# # urlpatterns = [
# #     # User APIs
# #     path('activate/', views.QRActivateView.as_view(), name='hunt-activate'),
# #     path('progress/', views.HuntProgressView.as_view(), name='hunt-progress'),
# #     path('dashboard/', views.HuntDashboardView.as_view(), name='hunt-dashboard'),
# #     path('verify-location/', views.LocationVerifyView.as_view(), name='hunt-verify-location'),
# #     path('leaderboard/', views.LeaderboardView.as_view(), name='hunt-leaderboard'),
# #     path('qr-status/<str:secret_hash>/', views.check_qr_status, name='hunt-qr-status'),
    
# #     # Admin APIs
# #     path('admin/locations/', views.HuntLocationListCreateView.as_view(), name='hunt-location-list'),
# #     path('admin/locations/<uuid:pk>/', views.HuntLocationDetailView.as_view(), name='hunt-location-detail'),
# #     path('admin/generate-qr/', views.generate_qr_batch, name='hunt-generate-qr'),
# #     path('admin/qr-codes/', views.admin_qr_list, name='hunt-admin-qr-list'),  # NEW - GET endpoint
# #     path('admin/dashboard-stats/', views.admin_dashboard_stats, name='hunt-admin-dashboard'),  # NEW
# # ]
# # In treasurehunt/urls.py - add this if main urls uses api/hunt/
# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import ArcViewSet, ShipPathViewSet, TreasureViewSet, MapViewSet, FounderProgressViewSet

# router = DefaultRouter()
# router.register(r'arcs', ArcViewSet, basename='arc')
# router.register(r'paths', ShipPathViewSet, basename='path')
# router.register(r'treasures', TreasureViewSet, basename='treasure')
# router.register(r'progress', FounderProgressViewSet, basename='progress')

# urlpatterns = [
#     path('', include(router.urls)),
#     path('map/world/', MapViewSet.as_view({'get': 'world'}), name='map-world'),
# ]



"""
TRANSFINITY Treasure Hunt - Integrated URL Routing
Path: backend/apps/treasurehunt/urls.py
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'arcs', views.ArcViewSet, basename='arc')
router.register(r'paths', views.ShipPathViewSet, basename='path')
router.register(r'treasures', views.TreasureViewSet, basename='treasure')
router.register(r'progress', views.FounderProgressViewSet, basename='progress')

urlpatterns = [
    path('', include(router.urls)),

    # World Map
    path('map/world/', views.MapViewSet.as_view({'get': 'world'}), name='map-world'),

    # Community
    path('community/progress/', views.community_progress, name='community-progress'),
    path('community/progress/<str:arc_key>/', views.arc_community_progress, name='arc-community-progress'),
    path('community/stats/', views.community_stats, name='community-stats'),

    # Leaderboard
    path('leaderboard/', views.leaderboard, name='leaderboard'),

    # Purchase Webhook
    path('webhooks/purchase/', views.purchase_webhook, name='purchase-webhook'),

    # Legacy T-Shirt QR Hunt
    path('activate/', views.QRActivateView.as_view(), name='hunt-activate'),
    path('hunt/progress/', views.HuntProgressView.as_view(), name='hunt-progress'),
    path('hunt/leaderboard/', views.LeaderboardView.as_view(), name='hunt-leaderboard'),
]