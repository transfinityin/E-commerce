from django.urls import path
from .views import (
    OrderCreateView, OrderListView, OrderDetailView, OrderCancelView,
    AdminOrderListView, AdminOrderDetailView, AdminOrderStatusUpdateView,
    AdminDashboardStatsView,  # ✅ NEW
    GetActiveMaps, GetMyMaps, ClaimMapReward, AssignMapOnPurchase,
)

urlpatterns = [
    # Customer
    path('',                          OrderCreateView.as_view()),
    path('my/',                       OrderListView.as_view()),
    path('<uuid:pk>/',                OrderDetailView.as_view()),
    path('<uuid:pk>/cancel/',         OrderCancelView.as_view()),

    # Admin
    path('admin/',                    AdminOrderListView.as_view()),
    path('admin/dashboard-stats/',    AdminDashboardStatsView.as_view()),  # ✅ NEW
    path('admin/<uuid:pk>/',          AdminOrderDetailView.as_view()),
    path('admin/<uuid:pk>/status/',   AdminOrderStatusUpdateView.as_view()),

    # Treasure Hunt
    path('treasure/assign/',          AssignMapOnPurchase.as_view(), name='assign-map'),
    path('treasure/active-maps/',     GetActiveMaps.as_view(), name='active-maps'),
    path('treasure/my-maps/',         GetMyMaps.as_view(), name='my-maps'),
    path('treasure/claim-reward/',    ClaimMapReward.as_view(), name='claim-reward'),
]