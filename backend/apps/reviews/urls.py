from django.urls import path
from .views import (
    ProductReviewListView, ReviewCreateView,
    ReviewDeleteView, AdminReviewListView,
)

urlpatterns = [
    path('product/<uuid:product_id>/',       ProductReviewListView.as_view()),
    path('product/<uuid:product_id>/create/', ReviewCreateView.as_view()),
    path('<uuid:pk>/delete/',                ReviewDeleteView.as_view()),
    path('admin/',                           AdminReviewListView.as_view()),
]