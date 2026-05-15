from django.urls import path
from .views import HeroBannerList, HeroBannerDetail

urlpatterns = [
    # Hero banners - direct paths
    path('hero-banners/', HeroBannerList.as_view(), name='hero-banners'),
    path('hero-banners/<uuid:pk>/', HeroBannerDetail.as_view(), name='hero-banner-detail'),
]