from django.urls import path
from . import views

urlpatterns = [
    # User APIs
    path('activate/', views.QRActivateView.as_view(), name='hunt-activate'),
    path('progress/', views.HuntProgressView.as_view(), name='hunt-progress'),
    path('dashboard/', views.HuntDashboardView.as_view(), name='hunt-dashboard'),
    path('verify-location/', views.LocationVerifyView.as_view(), name='hunt-verify-location'),
    path('leaderboard/', views.LeaderboardView.as_view(), name='hunt-leaderboard'),
    path('qr-status/<str:secret_hash>/', views.check_qr_status, name='hunt-qr-status'),
    
    # Admin APIs
    path('admin/locations/', views.HuntLocationListCreateView.as_view(), name='hunt-location-list'),
    path('admin/locations/<uuid:pk>/', views.HuntLocationDetailView.as_view(), name='hunt-location-detail'),
    path('admin/generate-qr/', views.generate_qr_batch, name='hunt-generate-qr'),
    path('admin/qr-codes/', views.admin_qr_list, name='hunt-admin-qr-list'),  # NEW - GET endpoint
    path('admin/dashboard-stats/', views.admin_dashboard_stats, name='hunt-admin-dashboard'),  # NEW
]