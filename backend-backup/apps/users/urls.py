# from django.urls import path
# from . import views
# from .views import (
#     RegisterView, LoginView, LogoutView,
#     ProfileView, ChangePasswordView,
#     ForgotPasswordView, ResetPasswordView,
#     AddressListCreateView, AddressDetailView, SetDefaultAddressView,
#     AdminUserListView, AdminUserDetailView, GoogleAuthView
# )

# urlpatterns = [
#     path('register/',        RegisterView.as_view(), name='register'),
#     path('login/',           LoginView.as_view(), name='login'),
#     path('logout/',          LogoutView.as_view(), name='logout'),
#     path('profile/',         ProfileView.as_view(), name='profile'),
#     path('change-password/', ChangePasswordView.as_view(), name='change-password'),
#     path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
#     path('reset-password/',  ResetPasswordView.as_view(), name='reset-password'),
    
#     # 🔥 ONLY ONE google/ path
#     path('google/', GoogleAuthView.as_view(), name='google-auth'),
    
#     path('addresses/',                       AddressListCreateView.as_view(), name='address-list'),
#     path('addresses/<uuid:pk>/',             AddressDetailView.as_view(), name='address-detail'),
#     path('addresses/<uuid:pk>/set-default/', SetDefaultAddressView.as_view(), name='set-default'),
    
#     path('admin/users/',           AdminUserListView.as_view(), name='admin-users'),
#     path('admin/users/<uuid:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    
#     path('me/rank/', views.my_rank, name='my-rank'),
#     path('scan-qr/', views.scan_qr, name='scan-qr'),
#     path('add-xp/', views.add_xp, name='add-xp'),
# ]

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from .views import (
    RegisterView, LoginView, LogoutView,
    ProfileView, ChangePasswordView,
    ForgotPasswordView, ResetPasswordView,
    AddressListCreateView, AddressDetailView, SetDefaultAddressView,
    AdminUserListView, AdminUserDetailView,
    GoogleAuthView, FacebookAuthView, TwitterAuthURLView, TwitterCallbackView
)

urlpatterns = [
    # ── Auth ──────────────────────────────────────────────
    path('register/',        RegisterView.as_view(), name='register'),
    path('login/',           LoginView.as_view(), name='login'),
    path('logout/',          LogoutView.as_view(), name='logout'),
    path('token/refresh/',   TokenRefreshView.as_view(), name='token-refresh'),  # 🔥 CRITICAL
    path('profile/',         ProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/',  ResetPasswordView.as_view(), name='reset-password'),
    
    # ── Social ────────────────────────────────────────────
    path('google/',    GoogleAuthView.as_view(), name='google-auth'),
    path('facebook/',  FacebookAuthView.as_view(), name='facebook-auth'),
    path('twitter/url/',     TwitterAuthURLView.as_view(), name='twitter-auth-url'),
    path('twitter/callback/', TwitterCallbackView.as_view(), name='twitter-callback'),
    
    # ── Address ─────────────────────────────────────────────
    path('addresses/',                       AddressListCreateView.as_view(), name='address-list'),
    path('addresses/<uuid:pk>/',             AddressDetailView.as_view(), name='address-detail'),
    path('addresses/<uuid:pk>/set-default/', SetDefaultAddressView.as_view(), name='set-default'),
    
    # ── Admin ───────────────────────────────────────────────
    path('admin/users/',           AdminUserListView.as_view(), name='admin-users'),
    path('admin/users/<uuid:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    
    # ── Gamification ──────────────────────────────────────
    path('me/rank/',  views.my_rank, name='my-rank'),
    path('scan-qr/',  views.scan_qr, name='scan-qr'),
    path('add-xp/',   views.add_xp, name='add-xp'),
]