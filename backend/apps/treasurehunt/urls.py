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
    path('map/world/', views.MapViewSet.as_view({'get': 'world'}), name='map-world'),
    path('community/progress/', views.community_progress, name='community-progress'),
    path('community/progress/<str:arc_key>/', views.arc_community_progress, name='arc-community-progress'),
    path('community/stats/', views.community_stats, name='community-stats'),
    path('leaderboard/', views.leaderboard, name='leaderboard'),
    path('webhooks/purchase/', views.purchase_webhook, name='purchase-webhook'),
    path('activate/', views.QRActivateView.as_view(), name='hunt-activate'),
    path('hunt-progress/', views.HuntProgressView.as_view(), name='hunt-progress'),
    path('hunt-leaderboard/', views.LeaderboardView.as_view(), name='hunt-leaderboard'),
    path('admin/dashboard-stats/', views.admin_dashboard_stats, name='admin-dashboard-stats'),
    path('admin/progress/', views.admin_progress_list, name='admin-progress'),
    path('admin/locations/', views.HuntLocationListCreateView.as_view(), name='admin-locations'),
    path('admin/locations/<int:pk>/', views.HuntLocationDetailView.as_view(), name='admin-location-detail'),
    path('admin/generate-qr/', views.generate_qr_batch, name='admin-generate-qr'),
    path('qr-status/<str:secret_hash>/', views.check_qr_status, name='qr-status'),

    path('mystery-claim/', views.ClaimMysteryCardView.as_view(), name='mystery-claim'),
    # path('progress/', views.HuntProgressView.as_view(), name='hunt-progress'),
]
print("TREASUREHUNT URLS LOADED")