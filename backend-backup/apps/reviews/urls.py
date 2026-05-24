# apps/reviews/urls.py
from django.urls import path
from .views import (
    ProductReviewListView, ReviewCreateView,
    ReviewDeleteView, AdminReviewListView,
    AdminReplyView,  # 👈 IMPORT
)

urlpatterns = [
    path('product/<uuid:product_id>/',       ProductReviewListView.as_view()),
    path('product/<uuid:product_id>/create/', ReviewCreateView.as_view()),
    path('<uuid:pk>/delete/',                ReviewDeleteView.as_view()),
    path('<uuid:pk>/reply/',                 AdminReplyView.as_view()),  # 👈 ADD THIS
    path('admin/',                           AdminReviewListView.as_view()),
]