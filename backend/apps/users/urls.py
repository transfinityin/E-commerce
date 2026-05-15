from django.urls import path
# urlpatterns missing
from django.urls import path
from .views import (
    RegisterView, LoginView, LogoutView,
    ProfileView, ChangePasswordView,
    ForgotPasswordView, ResetPasswordView,
    AddressListCreateView, AddressDetailView, SetDefaultAddressView,
    AdminUserListView, AdminUserDetailView,
)
from apps.users.views import GoogleAuthView


urlpatterns = [
    path('register/',        RegisterView.as_view()),
    path('login/',           LoginView.as_view()),
    path('logout/',          LogoutView.as_view()),
    path('profile/',         ProfileView.as_view()),
    path('change-password/', ChangePasswordView.as_view()),
    path('forgot-password/', ForgotPasswordView.as_view()),
    path('reset-password/',  ResetPasswordView.as_view()),
    path('addresses/',                       AddressListCreateView.as_view()),
    path('addresses/<uuid:pk>/',             AddressDetailView.as_view()),
    path('addresses/<uuid:pk>/set-default/', SetDefaultAddressView.as_view()),
    path('admin/users/',           AdminUserListView.as_view()),
    path('admin/users/<uuid:pk>/', AdminUserDetailView.as_view()),
    path('google/',  GoogleAuthView.as_view(), name='google-auth'),
]