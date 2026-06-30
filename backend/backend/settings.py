

import os
from pathlib import Path
from datetime import timedelta
import dj_database_url
from dotenv import load_dotenv
load_dotenv()


BASE_DIR = Path(__file__).resolve().parent.parent

# ── Security ─────────────────────────────────────────────────
SECRET_KEY = os.getenv('SECRET_KEY')
DEBUG = os.getenv('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# ── Apps ──────────────────────────────────────────────────────
DJANGO_APPS  = [
    'django.contrib.sites',        # 🔥 MUST BE FIRST — before allauth
    'unfold',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.postgres',
   
    # django-allauth — EXACT order (after sites)
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'allauth.socialaccount.providers.facebook',
    'allauth.socialaccount.providers.twitter',
    
    # dj-rest-auth — AFTER allauth
    'dj_rest_auth',
    'dj_rest_auth.registration',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'cloudinary',
    'cloudinary_storage',
    'django_filters',
    'rest_framework.authtoken',
]

LOCAL_APPS = [
    'apps.users',
    'apps.products',
    'apps.orders',
    'apps.cart',
    'apps.wishlist',
    'apps.payments',
    'apps.reviews',
    'apps.coupons',
    'apps.support',
    'apps.notifications',
    'apps.core',
    'apps.treasurehunt',
    'apps.utils'
] 

SITE_ID = 1
TOKEN_MODEL = None
REST_USE_JWT = True

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS
AUTH_USER_MODEL = 'users.User'

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
]
# Django 5+ kaga puthu Storage system (Ithu thaan Cloudinary-kku force pannum)
STORAGES = {
    "default": {
        "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}
ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# ── Database ─────────────────────────────────────────────────
if os.getenv('DATABASE_URL'):
    DATABASES = {
        'default': dj_database_url.config(
            default=os.getenv('DATABASE_URL'),
            conn_max_age=600,
            ssl_require=False,
        )
    }
else:
    DATABASES = {
        'default': dj_database_url.config(
            default=f"postgres://{os.getenv('DB_USER', 'transfinity_store_user')}:{os.getenv('DB_PASSWORD', 'ZFdfNQv9ByBHtOIsu6oh66Ntic25VI0T')}@{os.getenv('DB_HOST', 'dpg-d8tpkqbsq97s73cfa91g-a.oregon-postgres.render.com')}:{os.getenv('DB_PORT', '5432')}/{os.getenv('DB_NAME', 'transfinity_store')}",
            conn_max_age=600,
        )
    }

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ── Static & Media ───────────────────────────────────────────
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.getenv('CLOUDINARY_CLOUD_NAME'),
    'API_KEY':    os.getenv('CLOUDINARY_API_KEY'),
    'API_SECRET': os.getenv('CLOUDINARY_API_SECRET'),
}

# ── DRF ──────────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# ── SimpleJWT ─────────────────────────────────────────────────
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME':  timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS':  True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# ── CORS ─────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://transfinity.shop',
    'https://www.transfinity.shop',
    'https://e-commercetransfinity.vercel.app',
    'https://e-commercetransfinity-git-main-transfinityin-1144s-projects.vercel.app',
    'https://e-commercetransfinity-mrwe0lxmy-transfinityin-1144s-projects.vercel.app',
    'https://e-commercetransfinity-2m08ri7oh-transfinityin-1144s-projects.vercel.app',
]
CORS_ALLOW_ALL_ORIGINS = DEBUG  # 🔥 Production la False, Debug la True
CORS_ALLOW_CREDENTIALS = True

# ── Email ────────────────────────────────────────────────────
EMAIL_BACKEND    = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST       = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT       = int(os.getenv('EMAIL_PORT', '587'))
EMAIL_USE_TLS    = True
EMAIL_HOST_USER  = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'noreply@transfinity.shop')


GOOGLE_SHEET_ID = "1Cg0WdYbJSzrbzviaKmZ-NBXzvf_QgpTGoXw6o2aARfQ"

# ── URLs ─────────────────────────────────────────────────────
FRONTEND_URL = os.getenv('FRONTEND_URL', 'https://transfinity.shop')
BACKEND_URL  = os.getenv('BACKEND_URL', 'https://api.transfinity.shop')
# ── OAuth Credentials ─────────────────────────────────────────
GOOGLE_CLIENT_ID     = os.getenv('GOOGLE_CLIENT_ID', '')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET', '')
FACEBOOK_APP_ID      = os.getenv('FACEBOOK_APP_ID', '')
FACEBOOK_APP_SECRET  = os.getenv('FACEBOOK_APP_SECRET', '')
TWITTER_CLIENT_ID    = os.getenv('TWITTER_CLIENT_ID', '')
TWITTER_CLIENT_SECRET = os.getenv('TWITTER_CLIENT_SECRET', '')

# ── allauth Providers ─────────────────────────────────────────
SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'APP': {
            'client_id': GOOGLE_CLIENT_ID,
            'secret': GOOGLE_CLIENT_SECRET,
            'key': ''
        },
        'SCOPE': ['profile', 'email'],
        'AUTH_PARAMS': {'access_type': 'online'},
        'OAUTH_PKCE_ENABLED': True,
    },
    'facebook': {
        'APP': {
            'client_id': FACEBOOK_APP_ID,
            'secret': FACEBOOK_APP_SECRET,
        },
        'METHOD': 'oauth2',
        'SCOPE': ['email', 'public_profile'],
        'AUTH_PARAMS': {'auth_type': 'reauthenticate'},
        'FIELDS': ['id', 'email', 'name', 'picture'],
    },
    'twitter': {
        'APP': {
            'client_id': TWITTER_CLIENT_ID,
            'secret': TWITTER_CLIENT_SECRET,
        },
        'SCOPE': ['users.read', 'tweet.read', 'offline.access'],
    }
}

SOCIALACCOUNT_AUTO_SIGNUP = True
ACCOUNT_LOGIN_METHODS = {'email'}
ACCOUNT_SIGNUP_FIELDS = ['email*', 'password1*', 'password2*']

# ── Razorpay ──────────────────────────────────────────────────
RAZORPAY_KEY_ID     = os.getenv('RAZORPAY_KEY_ID')
RAZORPAY_KEY_SECRET = os.getenv('RAZORPAY_KEY_SECRET')

REST_AUTH = {
    'PASSWORD_RESET_SERIALIZER': 'apps.users.serializers.CustomPasswordResetSerializer',
}