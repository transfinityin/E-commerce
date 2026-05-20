from django.shortcuts import render
import logging

# Create your views here.
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.utils.crypto import get_random_string
from django.core.cache import cache
from rest_framework.decorators import api_view, permission_classes
 # 🔥 ADD THIS LINE
from rest_framework.permissions import IsAuthenticated  # 🔥 ADD THIS

from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserMiniSerializer  # Create this if not exists
from .permissions import IsAdmin
from django.contrib.auth import get_user_model
from rest_framework import generics, filters

from .models import Address,NotificationSettings
from .serializers import (
    RegisterSerializer, UserSerializer, UserUpdateSerializer,
    ChangePasswordSerializer, AddressSerializer,
    ForgotPasswordSerializer, ResetPasswordSerializer,NotificationSettingsSerializer
)

User = get_user_model()


def get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access':  str(refresh.access_token),
        'user': UserSerializer(user).data,
    }


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


class AdminUserListView(generics.ListAPIView):
    """Admin only - list all users"""
    serializer_class = UserMiniSerializer
    permission_classes = [IsAdmin]
    queryset = User.objects.all().order_by('-date_joined')
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email', 'phone']
    ordering_fields = ['date_joined', 'name']

class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    serializer_class   = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset           = User.objects.all()

# Existing imports kku bottom la add panum
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings

# class GoogleAuthView(APIView):
#     """
#     Frontend la Google login panna varum credential
#     itha verify panni JWT token return pannuvom
#     """
#     permission_classes = [permissions.AllowAny]

#     def post(self, request):
#         credential = request.data.get('credential')  # Google ID token

#         if not credential:
#             return Response({'error': 'Google credential required.'}, status=400)

#         try:
#             # Google token verify panum
#             idinfo = id_token.verify_oauth2_token(
#                 credential,
#                 google_requests.Request(),
#                 settings.GOOGLE_CLIENT_ID

#                 # settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['client_id'],
#             )

#             email = idinfo.get('email')
#             name  = idinfo.get('name', '')
#             # picture = idinfo.get('picture', '')  # profile photo

#             if not email:
#                 return Response({'error': 'Email not found in Google account.'}, status=400)

#             # User already exists → login. Illa → create
#             user, created = User.objects.get_or_create(
#                 email=email,
#                 defaults={
#                     'name':      name,
#                     'is_active': True,
#                     'role':      'user',
#                 }
#             )

#             # New user na unusable password set panum
#             if created:
#                 user.set_unusable_password()
#                 user.save()

#             if not user.is_active:
#                 return Response({'error': 'Account deactivated.'}, status=403)

#             return Response({
#                 'message': f'{"Account created" if created else "Welcome back"}, {user.name.split()[0]}!',
#                 **get_tokens(user),
#             })

#         except ValueError as e:
#             return Response({'error': f'Invalid Google token: {str(e)}'}, status=400)
#         except Exception as e:
#             return Response({'error': 'Google authentication failed.'}, status=500)


logger = logging.getLogger(__name__)
User = get_user_model()


def get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'user': UserSerializer(user).data,
    }


class GoogleAuthView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        credential = request.data.get('credential')

        if not credential:
            return Response({'error': 'Google credential required.'}, status=400)

        try:
            idinfo = id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID,
                clock_skew_in_seconds=10
            )

            email = idinfo.get('email')
            name = idinfo.get('name') or email.split('@')[0]

            if not email:
                return Response({'error': 'Email not found.'}, status=400)

            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'name': name,
                    'is_active': True,
                    'role': 'user',
                    'rank': 'wanderer',  # ✅ Default rank set pannum
                }
            )

            if created:
                user.set_unusable_password()
                user.save()

            if not user.is_active:
                return Response({'error': 'Account deactivated.'}, status=403)

            # ✅ Safe name handling
            display_name = user.name or email.split('@')[0]
            first_name = display_name.split()[0] if display_name else 'User'

            return Response({
                'message': f'{"Account created" if created else "Welcome back"}, {first_name}!',
                **get_tokens(user),
            })

        except ValueError as e:
            logger.error(f"Token error: {e}")
            return Response({'error': f'Invalid token: {str(e)}'}, status=400)

        except Exception as e:
            logger.exception("Google auth error")
            return Response({'error': str(e)}, status=500)
class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        s = ChangePasswordSerializer(data=request.data, context={'request': request})
        if s.is_valid():
            request.user.set_password(s.validated_data['new_password'])
            request.user.save()
            return Response({'message': 'Password changed.'})
        return Response(s.errors, status=400)







class NotificationSettingsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        settings, created = NotificationSettings.objects.get_or_create(user=request.user)
        return Response(NotificationSettingsSerializer(settings).data)
    
    def patch(self, request):
        settings, created = NotificationSettings.objects.get_or_create(user=request.user)
        serializer = NotificationSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Settings updated', 'settings': serializer.data})
        return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_rank(request):
    """GET /api/users/me/rank/"""
    user = request.user
    return Response({
        'rank': user.rank,
        'rank_display': user.get_rank_display(),
        'xp': user.xp,
        'unlocked_arcs': user.unlocked_arcs,
        'next_rank': user.unlock_next_rank() if False else None,  # Just preview
        'can_access': {
            'founder': user.can_access_arc('founder'),
            'ascendant': user.can_access_arc('ascendant'),
            'phantom': user.can_access_arc('phantom'),
            'eclipse': user.can_access_arc('eclipse'),
            'eternal': user.can_access_arc('eternal'),
        }
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def scan_qr(request):
    """POST /api/auth/scan-qr/"""
    code = request.data.get('code')
    
    try:
        from apps.treasurehunt.models import TShirtQRCode  # or your QR model
        
        qr = TShirtQRCode.objects.get(secret_hash=code, is_active=True)
        
        # Check if already scanned
        if request.user.qr_scans.filter(id=qr.id).exists():
            return Response({'error': 'Already scanned'}, status=400)
        
        request.user.qr_scans.add(qr)
        request.user.add_xp(qr.xp_reward or 50)
        
        return Response({
            'success': True,
            'xp_gained': qr.xp_reward or 50,
            'total_xp': request.user.xp,
            'rank': request.user.rank,
            'message': 'New truth revealed...'
        })
        
    except Exception as e:
        return Response({'error': 'Invalid code'}, status=404)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_xp(request):
    """POST /api/auth/add-xp/ (Admin/internal use)"""
    amount = request.data.get('amount', 0)
    request.user.add_xp(amount)
    return Response({
        'xp': request.user.xp,
        'rank': request.user.rank
    })