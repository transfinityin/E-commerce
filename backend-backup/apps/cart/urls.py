from django.urls import path
from .views import CartView, CartAddView, CartUpdateView

urlpatterns = [
    path('',                  CartView.as_view()),       # GET cart, DELETE clear
    path('add/',              CartAddView.as_view()),     # POST add item
    path('item/<uuid:item_id>/', CartUpdateView.as_view()),  # PATCH update, DELETE remove
]