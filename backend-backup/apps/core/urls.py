from django.urls import path
from .views import HeroBannerList, HeroBannerDetail, UploadImageView

urlpatterns = [
    path('hero-banners/',           HeroBannerList.as_view(),   name='hero-banners'),
    path('hero-banners/<uuid:pk>/', HeroBannerDetail.as_view(), name='hero-banner-detail'),
    path('upload-image/',           UploadImageView.as_view(),  name='upload-image'),
]