from django.urls import path
from .views import (
    OrderCreateView, OrderListView, OrderDetailView, OrderCancelView,
    AdminOrderListView, AdminOrderDetailView, AdminOrderStatusUpdateView,GetActiveMaps,
    GetMyMaps,
    ClaimMapReward,
)

urlpatterns = [
    path('',                          OrderCreateView.as_view()),   # POST create
    path('my/',                       OrderListView.as_view()),     # GET my orders
    path('<uuid:pk>/',                OrderDetailView.as_view()),   # GET detail
    path('<uuid:pk>/cancel/',         OrderCancelView.as_view()),   # POST cancel
    path('admin/',                    AdminOrderListView.as_view()),
    path('admin/<uuid:pk>/',          AdminOrderDetailView.as_view()),
    path('admin/<uuid:pk>/status/',   AdminOrderStatusUpdateView.as_view()),
    # Treasure Hunt
    path('treasure/active-maps/', GetActiveMaps.as_view(), name='active-maps'),
    path('treasure/my-maps/', GetMyMaps.as_view(), name='my-maps'),
    path('treasure/claim-reward/', ClaimMapReward.as_view(), name='claim-reward'),
]