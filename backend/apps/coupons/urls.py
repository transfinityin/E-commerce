from django.urls import path
from .views import (
    
    CouponValidateView,
    AdminCouponListCreateView,
    AdminCouponDetailView,
    QRScanView,
    AdminQROfferListCreateView,
    AdminQROfferDetailView,
    AdminQRScanLogsView,
)

urlpatterns = [
    path('validate/',          CouponValidateView.as_view()),
    path('admin/',             AdminCouponListCreateView.as_view()),
    path('admin/<uuid:pk>/',   AdminCouponDetailView.as_view()),
    # NEW QR Routes
    path('qr-scan/', QRScanView.as_view(), name='qr-scan'),
    path('admin/qr-offers/', AdminQROfferListCreateView.as_view(), name='admin-qr-list'),
    path('admin/qr-offers/<str:qr_code_id>/', AdminQROfferDetailView.as_view(), name='admin-qr-detail'),
    path('admin/qr-logs/', AdminQRScanLogsView.as_view(), name='admin-qr-logs'),

]