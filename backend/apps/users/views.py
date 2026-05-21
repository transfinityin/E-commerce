# from django.contrib.auth import get_user_model
# from django.core.mail import send_mail
# from django.conf import settings
# from django.utils.crypto import get_random_string
# from django.core.cache import cache
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated
# from rest_framework import status, generics, permissions, filters
# from rest_framework.response import Response
# from rest_framework.views import APIView
# from rest_framework_simplejwt.tokens import RefreshToken
# from google.oauth2 import id_token
# from google.auth.transport import requests as google_requests
# import logging

# from .models import Address, NotificationSettings
# from .serializers import (
#     RegisterSerializer, UserSerializer, UserUpdateSerializer,
#     ChangePasswordSerializer, AddressSerializer,
#     ForgotPasswordSerializer, ResetPasswordSerializer,
#     NotificationSettingsSerializer, UserMiniSerializer
# )
# from .permissions import IsAdmin

# logger = logging.getLogger(__name__)
# User = get_user_model()


# # ── ONE get_tokens function only ──────────────────────────────
# def get_tokens(user):
#     refresh = RefreshToken.for_user(user)
#     return {
#         'refresh': str(refresh),
#         'access':  str(refresh.access_token),
#         'user':    UserSerializer(user).data,
#     }


# class RegisterView(APIView):
#     permission_classes = [permissions.AllowAny]
#     def post(self, request):
#         serializer = RegisterSerializer(data=request.data)
#         if serializer.is_valid():
#             user = serializer.save()
#             return Response({'message': 'Account created!', **get_tokens(user)}, status=201)
#         return Response(serializer.errors, status=400)


# class LoginView(APIView):
#     permission_classes = [permissions.AllowAny]
#     def post(self, request):
#         email    = request.data.get('email', '').strip().lower()
#         password = request.data.get('password', '')
#         if not email or not password:
#             return Response({'error': 'Email and password required.'}, status=400)
#         try:
#             user = User.objects.get(email=email)
#         except User.DoesNotExist:
#             return Response({'error': 'Invalid credentials.'}, status=401)
#         if not user.check_password(password):
#             return Response({'error': 'Invalid credentials.'}, status=401)
#         if not user.is_active:
#             return Response({'error': 'Account deactivated.'}, status=403)
#         return Response(get_tokens(user))


# class LogoutView(APIView):
#     permission_classes = [permissions.IsAuthenticated]
#     def post(self, request):
#         try:
#             token = RefreshToken(request.data.get('refresh'))
#             token.blacklist()
#             return Response({'message': 'Logged out.'})
#         except Exception:
#             return Response({'error': 'Invalid token.'}, status=400)


# class ProfileView(APIView):
#     permission_classes = [permissions.IsAuthenticated]
#     def get(self, request):
#         return Response(UserSerializer(request.user).data)
#     def patch(self, request):
#         s = UserUpdateSerializer(request.user, data=request.data, partial=True)
#         if s.is_valid():
#             s.save()
#             return Response({'message': 'Profile updated.', 'user': UserSerializer(request.user).data})
#         return Response(s.errors, status=400)


# class ChangePasswordView(APIView):
#     permission_classes = [permissions.IsAuthenticated]
#     def post(self, request):
#         s = ChangePasswordSerializer(data=request.data, context={'request': request})
#         if s.is_valid():
#             request.user.set_password(s.validated_data['new_password'])
#             request.user.save()
#             return Response({'message': 'Password changed.'})
#         return Response(s.errors, status=400)


# class ForgotPasswordView(APIView):
#     permission_classes = [permissions.AllowAny]
#     def post(self, request):
#         s = ForgotPasswordSerializer(data=request.data)
#         if s.is_valid():
#             email = s.validated_data['email']
#             token = get_random_string(64)
#             cache.set(f'pwd_reset_{token}', email, timeout=900)
#             reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
#             try:
#                 send_mail('Reset Password', f'Link: {reset_url}',
#                           settings.DEFAULT_FROM_EMAIL, [email])
#             except Exception:
#                 pass
#             return Response({'message': 'Reset link sent to email.'})
#         return Response(s.errors, status=400)


# class ResetPasswordView(APIView):
#     permission_classes = [permissions.AllowAny]
#     def post(self, request):
#         s = ResetPasswordSerializer(data=request.data)
#         if s.is_valid():
#             token = s.validated_data['token']
#             email = cache.get(f'pwd_reset_{token}')
#             if not email:
#                 return Response({'error': 'Invalid or expired link.'}, status=400)
#             try:
#                 user = User.objects.get(email=email)
#                 user.set_password(s.validated_data['new_password'])
#                 user.save()
#                 cache.delete(f'pwd_reset_{token}')
#                 return Response({'message': 'Password reset successful.'})
#             except User.DoesNotExist:
#                 return Response({'error': 'User not found.'}, status=404)
#         return Response(s.errors, status=400)


# class AddressListCreateView(generics.ListCreateAPIView):
#     serializer_class   = AddressSerializer
#     permission_classes = [permissions.IsAuthenticated]
#     def get_queryset(self):
#         return Address.objects.filter(user=self.request.user)


# class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
#     serializer_class   = AddressSerializer
#     permission_classes = [permissions.IsAuthenticated]
#     def get_queryset(self):
#         return Address.objects.filter(user=self.request.user)


# class SetDefaultAddressView(APIView):
#     permission_classes = [permissions.IsAuthenticated]
#     def post(self, request, pk):
#         try:
#             addr = Address.objects.get(pk=pk, user=request.user)
#             Address.objects.filter(user=request.user).update(is_default=False)
#             addr.is_default = True
#             addr.save()
#             return Response({'message': 'Default address updated.'})
#         except Address.DoesNotExist:
#             return Response({'error': 'Address not found.'}, status=404)


# class AdminUserListView(generics.ListAPIView):
#     serializer_class   = UserMiniSerializer
#     permission_classes = [IsAdmin]
#     queryset           = User.objects.all().order_by('-date_joined')
#     filter_backends    = [filters.SearchFilter, filters.OrderingFilter]
#     search_fields      = ['name', 'email', 'phone']
#     ordering_fields    = ['date_joined', 'name']


# class AdminUserDetailView(generics.RetrieveUpdateAPIView):
#     serializer_class   = UserSerializer
#     permission_classes = [permissions.IsAdminUser]
#     queryset           = User.objects.all()


# # ── Google Auth ───────────────────────────────────────────────
# class GoogleAuthView(APIView):
#     permission_classes = [permissions.AllowAny]

#     def post(self, request):
#         credential = request.data.get('credential')
#         if not credential:
#             return Response({'error': 'Google credential required.'}, status=400)

#         try:
#             idinfo = id_token.verify_oauth2_token(
#                 credential,
#                 google_requests.Request(),
#                 settings.GOOGLE_CLIENT_ID,
#                 clock_skew_in_seconds=10,
#             )

#             email = idinfo.get('email')
#             name  = idinfo.get('name') or (email.split('@')[0] if email else 'User')

#             if not email:
#                 return Response({'error': 'Email not found.'}, status=400)

#             user, created = User.objects.get_or_create(
#                 email=email,
#                 defaults={
#                     'name':      name,
#                     'is_active': True,
#                     'role':      'user',
#                 }
#             )

#             if created:
#                 user.set_unusable_password()
#                 user.save()

#             if not user.is_active:
#                 return Response({'error': 'Account deactivated.'}, status=403)

#             first_name = (user.name or email.split('@')[0]).split()[0]

#             return Response({
#                 'message': f'{"Account created" if created else "Welcome back"}, {first_name}!',
#                 **get_tokens(user),
#             })

#         except ValueError as e:
#             logger.error(f"Token verification error: {e}")
#             return Response({'error': f'Invalid Google token: {str(e)}'}, status=400)
#         except Exception as e:
#             logger.exception("Google auth unexpected error")
#             return Response({'error': str(e)}, status=500)


# class NotificationSettingsView(APIView):
#     permission_classes = [permissions.IsAuthenticated]

#     def get(self, request):
#         obj, _ = NotificationSettings.objects.get_or_create(user=request.user)
#         return Response(NotificationSettingsSerializer(obj).data)

#     def patch(self, request):
#         obj, _ = NotificationSettings.objects.get_or_create(user=request.user)
#         s = NotificationSettingsSerializer(obj, data=request.data, partial=True)
#         if s.is_valid():
#             s.save()
#             return Response({'message': 'Settings updated', 'settings': s.data})
#         return Response(s.errors, status=400)


# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def my_rank(request):
#     user = request.user
#     return Response({
#         'rank':         user.rank,
#         'rank_display': user.get_rank_display(),
#         'xp':           user.xp,
#         'unlocked_arcs': user.unlocked_arcs,
#     })


# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def scan_qr(request):
#     code = request.data.get('code')
#     try:
#         from apps.treasurehunt.models import TShirtQRCode
#         qr = TShirtQRCode.objects.get(secret_hash=code, is_active=True)
#         if request.user.qr_scans.filter(id=qr.id).exists():
#             return Response({'error': 'Already scanned'}, status=400)
#         request.user.qr_scans.add(qr)
#         request.user.add_xp(qr.xp_reward or 50)
#         return Response({
#             'success':   True,
#             'xp_gained': qr.xp_reward or 50,
#             'total_xp':  request.user.xp,
#             'rank':      request.user.rank,
#             'message':   'New truth revealed...',
#         })
#     except Exception:
#         return Response({'error': 'Invalid code'}, status=404)


# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def add_xp(request):
#     amount = request.data.get('amount', 0)
#     request.user.add_xp(amount)
#     return Response({'xp': request.user.xp, 'rank': request.user.rank})



from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.utils.crypto import get_random_string
from django.core.cache import cache
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, generics, permissions, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import requests
import json
import base64
import hashlib
import secrets
import logging

from .models import Address, NotificationSettings
from .serializers import (
    RegisterSerializer, UserSerializer, UserUpdateSerializer,
    ChangePasswordSerializer, AddressSerializer,
    ForgotPasswordSerializer, ResetPasswordSerializer,
    NotificationSettingsSerializer, UserMiniSerializer
)
from .permissions import IsAdmin

logger = logging.getLogger(__name__)
User = get_user_model()


# ── Helpers ───────────────────────────────────────────────────
def get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access':  str(refresh.access_token),
        'user':    UserSerializer(user).data,
    }


# ── Register / Login / Logout ─────────────────────────────────
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({'message': 'Account created!', **get_tokens(user)}, status=201)
        return Response(serializer.errors, status=400)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        email    = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')
        if not email or not password:
            return Response({'error': 'Email and password required.'}, status=400)
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials.'}, status=401)
        if not user.check_password(password):
            return Response({'error': 'Invalid credentials.'}, status=401)
        if not user.is_active:
            return Response({'error': 'Account deactivated.'}, status=403)
        return Response(get_tokens(user))


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        try:
            token = RefreshToken(request.data.get('refresh'))
            token.blacklist()
            return Response({'message': 'Logged out.'})
        except Exception:
            return Response({'error': 'Invalid token.'}, status=400)


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        return Response(UserSerializer(request.user).data)
    def patch(self, request):
        s = UserUpdateSerializer(request.user, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return Response({'message': 'Profile updated.', 'user': UserSerializer(request.user).data})
        return Response(s.errors, status=400)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        s = ChangePasswordSerializer(data=request.data, context={'request': request})
        if s.is_valid():
            request.user.set_password(s.validated_data['new_password'])
            request.user.save()
            return Response({'message': 'Password changed.'})
        return Response(s.errors, status=400)


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        s = ForgotPasswordSerializer(data=request.data)
        if s.is_valid():
            email = s.validated_data['email']
            token = get_random_string(64)
            cache.set(f'pwd_reset_{token}', email, timeout=900)
            reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
            try:
                send_mail('Reset Password', f'Link: {reset_url}',
                          settings.DEFAULT_FROM_EMAIL, [email])
            except Exception:
                pass
            return Response({'message': 'Reset link sent to email.'})
        return Response(s.errors, status=400)


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        s = ResetPasswordSerializer(data=request.data)
        if s.is_valid():
            token = s.validated_data['token']
            email = cache.get(f'pwd_reset_{token}')
            if not email:
                return Response({'error': 'Invalid or expired link.'}, status=400)
            try:
                user = User.objects.get(email=email)
                user.set_password(s.validated_data['new_password'])
                user.save()
                cache.delete(f'pwd_reset_{token}')
                return Response({'message': 'Password reset successful.'})
            except User.DoesNotExist:
                return Response({'error': 'User not found.'}, status=404)
        return Response(s.errors, status=400)


# ── Address ───────────────────────────────────────────────────
class AddressListCreateView(generics.ListCreateAPIView):
    serializer_class   = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


class SetDefaultAddressView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, pk):
        try:
            addr = Address.objects.get(pk=pk, user=request.user)
            Address.objects.filter(user=request.user).update(is_default=False)
            addr.is_default = True
            addr.save()
            return Response({'message': 'Default address updated.'})
        except Address.DoesNotExist:
            return Response({'error': 'Address not found.'}, status=404)


# ── Admin ─────────────────────────────────────────────────────
class AdminUserListView(generics.ListAPIView):
    serializer_class   = UserMiniSerializer
    permission_classes = [IsAdmin]
    queryset           = User.objects.all().order_by('-date_joined')
    filter_backends    = [filters.SearchFilter, filters.OrderingFilter]
    search_fields      = ['name', 'email', 'phone']
    ordering_fields    = ['date_joined', 'name']


class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    serializer_class   = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset           = User.objects.all()


# ── Google Auth ───────────────────────────────────────────────
class GoogleAuthView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        credential = request.data.get('credential')
        print(f"🔥 Received credential: {credential[:30] if credential else 'NONE'}...")
        print(f"🔥 Using CLIENT_ID: {settings.GOOGLE_CLIENT_ID[:20]}...")

        if not credential:
            return Response({'error': 'Google credential required.'}, status=400)

        try:
            idinfo = id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID,
                clock_skew_in_seconds=10,
            )
            print(f"🔥 Token verified! Email: {idinfo.get('email')}")

            email = idinfo.get('email')
            name  = idinfo.get('name') or (email.split('@')[0] if email else 'User')

            if not email:
                return Response({'error': 'Email not found.'}, status=400)

            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'name':      name,
                    'is_active': True,
                    'role':      'user',
                }
            )

            if created:
                user.set_unusable_password()
                user.save()

            if not user.is_active:
                return Response({'error': 'Account deactivated.'}, status=403)

            first_name = (user.name or email.split('@')[0]).split()[0]

            return Response({
                'message': f'{"Account created" if created else "Welcome back"}, {first_name}!',
                **get_tokens(user),
            })

        except ValueError as e:
            print(f"❌ Token verification ValueError: {e}")
            logger.error(f"Token verification error: {e}")
            return Response({'error': f'Invalid Google token: {str(e)}'}, status=400)
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            logger.exception("Google auth unexpected error")
            return Response({'error': str(e)}, status=500)

# ── Facebook Auth ─────────────────────────────────────────────
class FacebookAuthView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        access_token = request.data.get('access_token')
        if not access_token:
            return Response({'error': 'Facebook access token required.'}, status=400)

        fb_url = f'https://graph.facebook.com/v18.0/me?access_token={access_token}&fields=id,name,email,picture'
        fb_resp = requests.get(fb_url)

        if fb_resp.status_code != 200:
            return Response({'error': 'Invalid Facebook access token.'}, status=400)

        fb_data = fb_resp.json()
        email = fb_data.get('email')
        name  = fb_data.get('name', 'User')

        if not email:
            return Response({'error': 'Email not provided by Facebook. Ensure email permission is granted.'}, status=400)

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'name':      name,
                'is_active': True,
                'role':      'user',
            }
        )

        if created:
            user.set_unusable_password()
            user.save()

        if not user.is_active:
            return Response({'error': 'Account deactivated.'}, status=403)

        return Response({
            'message': f'{"Account created" if created else "Welcome back"}, {name.split()[0]}!',
            **get_tokens(user),
        })


# ── Twitter Auth ──────────────────────────────────────────────
class TwitterAuthURLView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        code_verifier = base64.urlsafe_b64encode(
            secrets.token_bytes(32)
        ).rstrip(b'=').decode('ascii')
        code_challenge = base64.urlsafe_b64encode(
            hashlib.sha256(code_verifier.encode()).digest()
        ).rstrip(b'=').decode('ascii')
        state = get_random_string(32)

        cache.set(f'twitter_pkce_{state}', code_verifier, timeout=300)

        redirect_uri = f"{settings.BACKEND_URL}/api/auth/twitter/callback/"

        params = {
            'response_type': 'code',
            'client_id': settings.TWITTER_CLIENT_ID,
            'redirect_uri': redirect_uri,
            'scope': 'users.read tweet.read offline.access',
            'state': state,
            'code_challenge': code_challenge,
            'code_challenge_method': 'S256',
        }

        auth_url = 'https://twitter.com/i/oauth2/authorize?' + requests.compat.urlencode(params)
        return Response({'auth_url': auth_url})


class TwitterCallbackView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        code  = request.GET.get('code')
        state = request.GET.get('state')
        error = request.GET.get('error')

        if error:
            return Response({'error': f'Twitter error: {error}'}, status=400)
        if not code or not state:
            return Response({'error': 'Missing code or state.'}, status=400)

        code_verifier = cache.get(f'twitter_pkce_{state}')
        if not code_verifier:
            return Response({'error': 'Session expired or invalid state.'}, status=400)

        redirect_uri = f"{settings.BACKEND_URL}/api/auth/twitter/callback/"

        token_resp = requests.post(
            'https://api.twitter.com/2/oauth2/token',
            data={
                'code': code,
                'grant_type': 'authorization_code',
                'redirect_uri': redirect_uri,
                'code_verifier': code_verifier,
            },
            auth=(settings.TWITTER_CLIENT_ID, settings.TWITTER_CLIENT_SECRET),
        )

        if token_resp.status_code != 200:
            logger.error(f"Twitter token exchange failed: {token_resp.text}")
            return Response({'error': 'Failed to exchange Twitter code.'}, status=400)

        token_data = token_resp.json()
        access_token = token_data.get('access_token')

        # Get user info from Twitter
        user_resp = requests.get(
            'https://api.twitter.com/2/users/me',
            headers={'Authorization': f'Bearer {access_token}'},
            params={'user.fields': 'name,username,profile_image_url'},
        )

        if user_resp.status_code != 200:
            return Response({'error': 'Failed to get Twitter user info.'}, status=400)

        tw_user  = user_resp.json().get('data', {})
        username = tw_user.get('username', 'user')
        name     = tw_user.get('name', username)

        # 🔥 Twitter API v2 doesn't always return email.
        # We create a placeholder email. In production, collect email separately
        # or apply for Twitter Elevated access to request email scope.
        email = f'{username}@twitter.user'

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'name':     name,
                'username': username,
                'is_active': True,
                'role':      'user',
            }
        )

        if created:
            user.set_unusable_password()
            user.save()

        if not user.is_active:
            return Response({'error': 'Account deactivated.'}, status=403)

        tokens = get_tokens(user)
        tokens_json = json.dumps(tokens)

        # Return HTML that sends tokens to parent window and closes popup
        html = f"""
        <!DOCTYPE html>
        <html><body>
        <script>
            window.opener.postMessage({{
                type: 'TWITTER_AUTH_SUCCESS',
                payload: {tokens_json}
            }}, '{settings.FRONTEND_URL}');
            window.close();
        </script></body></html>
        """
        return HttpResponse(html)


# ── Notifications ─────────────────────────────────────────────
class NotificationSettingsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        obj, _ = NotificationSettings.objects.get_or_create(user=request.user)
        return Response(NotificationSettingsSerializer(obj).data)

    def patch(self, request):
        obj, _ = NotificationSettings.objects.get_or_create(user=request.user)
        s = NotificationSettingsSerializer(obj, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return Response({'message': 'Settings updated', 'settings': s.data})
        return Response(s.errors, status=400)


# ── Rank / QR / XP ────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_rank(request):
    user = request.user
    return Response({
        'rank':         user.rank,
        'rank_display': user.get_rank_display(),
        'xp':           user.xp,
        'unlocked_arcs': user.unlocked_arcs,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def scan_qr(request):
    code = request.data.get('code')
    try:
        from apps.treasurehunt.models import TShirtQRCode
        qr = TShirtQRCode.objects.get(secret_hash=code, is_active=True)
        if request.user.qr_scans.filter(id=qr.id).exists():
            return Response({'error': 'Already scanned'}, status=400)
        request.user.qr_scans.add(qr)
        request.user.add_xp(qr.xp_reward or 50)
        return Response({
            'success':   True,
            'xp_gained': qr.xp_reward or 50,
            'total_xp':  request.user.xp,
            'rank':      request.user.rank,
            'message':   'New truth revealed...',
        })
    except Exception:
        return Response({'error': 'Invalid code'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_xp(request):
    amount = request.data.get('amount', 0)
    request.user.add_xp(amount)
    return Response({'xp': request.user.xp, 'rank': request.user.rank})