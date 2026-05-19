
from django.contrib import admin
from django.urls import path,include
from rest_framework_simplejwt.views import TokenRefreshView,TokenObtainPairView
from django.conf import settings
from django.conf.urls.static import static
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = "http://localhost:5173/login"  # Your React app URL
    client_class = OAuth2Client

urlpatterns = [
    
    path('admin/', admin.site.urls),
     # Auth
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # App APIs
    path('api/auth/',          include('apps.users.urls')),
    path('api/products/',      include('apps.products.urls')),
    path('api/cart/',          include('apps.cart.urls')),
    path('api/wishlist/',      include('apps.wishlist.urls')),
    path('api/orders/',        include('apps.orders.urls')),
    path('api/payments/',      include('apps.payments.urls')),
    path('api/reviews/',       include('apps.reviews.urls')),
    path('api/coupons/',       include('apps.coupons.urls')),
    path('api/support/',       include('apps.support.urls')),
    path('api/core/', include('apps.core.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/auth/social/google/', GoogleLogin.as_view(), name='google_login'),
    path('accounts/', include('allauth.urls')),  # OAuth redirects
    path('api/hunt/', include('apps.treasurehunt.urls')),
 
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
 