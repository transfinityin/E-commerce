from django.urls import path
from .views import WishlistView, WishlistToggleView, WishlistRemoveView

urlpatterns = [
    path('',              WishlistView.as_view()),        # GET all wishlist items
    path('toggle/',       WishlistToggleView.as_view()),  # POST toggle add/remove
    path('<uuid:pk>/',    WishlistRemoveView.as_view()),  # DELETE remove item
]