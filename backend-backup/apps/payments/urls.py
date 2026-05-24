from django.urls import path
from .views import CreateRazorpayOrderView, VerifyPaymentView

urlpatterns = [
    path('create/',  CreateRazorpayOrderView.as_view()),
    path('verify/',  VerifyPaymentView.as_view()),
]