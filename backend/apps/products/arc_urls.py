from django.urls import path
from . import arc_views  # We'll create this

urlpatterns = [
    path('', arc_views.arc_list, name='arc_list'),
    path('<str:arc_name>/lore/', arc_views.arc_lore, name='arc_lore'),
    path('<str:arc_name>/products/', arc_views.arc_products, name='arc_products'),
]