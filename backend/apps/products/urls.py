from django.urls import path
from .views import (
    CategoryListView, CategoryDetailView,
    AdminCategoryListCreateView, AdminCategoryDetailView,
    ProductListView, ProductDetailView,
    RelatedProductsView, FeaturedProductsView,
    NewArrivalsView, SearchView,
    AdminProductListCreateView, AdminProductDetailView,
    ProductImageUploadView, SetPrimaryImageView,
)
from . import views

urlpatterns = [
    path('categories/',                      CategoryListView.as_view()),
    path('categories/<slug:slug>/',          CategoryDetailView.as_view()),
    path('',                                 ProductListView.as_view()),
    path('search/',                          SearchView.as_view()),
    path('featured/',                        FeaturedProductsView.as_view()),
    path('new-arrivals/',                    NewArrivalsView.as_view()),
    path('<slug:slug>/',                     ProductDetailView.as_view()),
    path('<slug:slug>/related/',             RelatedProductsView.as_view()),
    path('admin/categories/',                AdminCategoryListCreateView.as_view()),
    path('admin/categories/<uuid:pk>/',      AdminCategoryDetailView.as_view()),
    path('admin/products/',                  AdminProductListCreateView.as_view()),
    path('admin/products/<uuid:pk>/',        AdminProductDetailView.as_view()),
    path('admin/products/<uuid:product_id>/images/',                         ProductImageUploadView.as_view()),
    path('admin/products/<uuid:product_id>/images/<uuid:image_id>/primary/', SetPrimaryImageView.as_view()),

    # === NEW: TRANSFINITY ARC SYSTEM ===
    path('arcs/', views.arc_list, name='arc_list'),
    path('arcs/<str:arc_name>/lore/', views.arc_lore, name='arc_lore'),
    path('arcs/<str:arc_name>/products/', views.arc_products, name='arc_products'),
]