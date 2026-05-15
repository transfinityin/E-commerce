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
]