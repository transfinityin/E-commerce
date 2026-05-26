from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, generics,status  
# from apps.orders.models import Coupon
from apps.users.permissions import IsAdmin
from .serializers import CouponSerializer, CouponValidateSerializer
from django.utils import timezone          # ← ADD THIS
from django.db import transaction          # ← ADD THIS (if missing)
from datetime import timedelta  
import secrets
from apps.treasurehunt.models import MysteryCardQR, TShirtQRCode, UserHuntProgress, HuntLeaderboard
from apps.treasurehunt.utils import calculate_hunt_score
from .models import Coupon, QROffer, QRScanLog
from .serializers import (
    CouponSerializer, CouponValidateSerializer,
    QROfferSerializer, QRScanResponseSerializer, QRScanLogSerializer
)
class CouponValidateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CouponValidateSerializer(data=request.data)
        if serializer.is_valid():
            coupon   = serializer.validated_data['coupon']
            discount = serializer.validated_data['discount']
            return Response({
                'valid':          True,
                'code':           coupon.code,
                'discount_type':  coupon.discount_type,
                'discount_value': coupon.discount_value,
                'discount':       discount,
                'message':        f'Coupon applied! You save ₹{discount}',
            })
        return Response(serializer.errors, status=400)


# Admin CRUD
class AdminCouponListCreateView(generics.ListCreateAPIView):
    serializer_class   = CouponSerializer
    permission_classes = [IsAdmin]
    queryset           = Coupon.objects.all().order_by('-created_at')


class AdminCouponDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = CouponSerializer
    permission_classes = [IsAdmin]
    queryset           = Coupon.objects.all()




# ═══════════════════════════════════════════════════════
# NEW: QR Offer Views
# ═══════════════════════════════════════════════════════

# class QRScanView(APIView):
#     """
#     POST /api/coupons/qr-scan/
#     Body: { "qr_code_id": "abc123", "device_id": "device_123" }
    
#     Customer scans QR - reveals discount
#     """
#     permission_classes = [permissions.AllowAny]  # Anyone can scan

#     def post(self, request):
#         qr_code_id = request.data.get('qr_code_id')
#         device_id = request.data.get('device_id', '')
        
#         # Get client IP
#         ip_address = self.get_client_ip(request)
#          # Validate input
#         if not qr_code_id:
#             return Response({
#                 'success': False,
#                 'message': 'QR code ID is required'
#             }, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             qr_offer = QROffer.objects.get(qr_code_id=qr_code_id)
#         except QROffer.DoesNotExist:
#             # Return 400 instead of 404 to avoid "Not Found" URL confusion
#             return Response({
#                 'success': False,
#                 'message': 'Invalid QR Code!'
#             }, status=status.HTTP_400_BAD_REQUEST)
#         # Check if offer is valid
#         if not qr_offer.is_valid():
#             return Response({
#                 'success': False,
#                 'message': 'This offer has expired or reached its limit!'
#             }, status=status.HTTP_400_BAD_REQUEST)
#         # try:
#         #     qr_offer = QROffer.objects.get(qr_code_id=qr_code_id)
#         # except QROffer.DoesNotExist:
#         #     return Response({
#         #         'success': False,
#         #         'message': 'Invalid QR Code!'
#         #     }, status=status.HTTP_404_NOT_FOUND)

#         # Check if offer is valid
#         if not qr_offer.is_valid():
#             return Response({
#                 'success': False,
#                 'message': 'This offer has expired or reached its limit!'
#             }, status=status.HTTP_400_BAD_REQUEST)

#         # Check if this device already scanned recently (anti-fraud)
#         recent_scan = QRScanLog.objects.filter(
#             qr_offer=qr_offer,
#             device_id=device_id,
#             scanned_at__gte=timezone.now() - timedelta(hours=24),
#             is_used=False
#         ).first()

#         if recent_scan:
#             return Response({
#                 'success': True,
#                 'reveal_type': qr_offer.reveal_type,
#                 'discount': recent_scan.discount_revealed,
#                 'coupon_code': recent_scan.coupon_code,
#                 'expires_at': recent_scan.expires_at,
#                 'title': qr_offer.title,
#                 'message': 'You already have an active discount!'
#             })

#         # Generate discount
#         discount_value = qr_offer.get_random_discount()

#         # Create coupon code for this scan
#         coupon_code = f"QR{secrets.token_urlsafe(6)[:8].upper()}"

#         # Create the actual Coupon
#         with transaction.atomic():
#             coupon = Coupon.objects.create(
#                 code=coupon_code,
#                 description=f"QR Offer: {qr_offer.title}",
#                 discount_type='percent',
#                 discount_value=discount_value,
#                 max_uses=1,  # One time use
#                 is_active=True,
#                 expires_at=timezone.now() + timedelta(minutes=qr_offer.scan_expiry_minutes)
#             )

#             # Update QR offer scan count
#             qr_offer.scan_count += 1
#             qr_offer.save()

#             # Log the scan
#             scan_log = QRScanLog.objects.create(
#                 qr_offer=qr_offer,
#                 user=request.user if request.user.is_authenticated else None,
#                 device_id=device_id,
#                 ip_address=ip_address,
#                 discount_revealed=discount_value,
#                 coupon_code=coupon_code,
#                 expires_at=timezone.now() + timedelta(minutes=qr_offer.scan_expiry_minutes)
#             )

#         return Response({
#             'success': True,
#             'reveal_type': qr_offer.reveal_type,
#             'discount': discount_value,
#             'coupon_code': coupon_code,
#             'expires_at': scan_log.expires_at,
#             'title': qr_offer.title,
#             'message': f'🎉 You won {discount_value}% off!'
#         })

#     def get_client_ip(self, request):
#         x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
#         if x_forwarded_for:
#             return x_forwarded_for.split(',')[0]
#         return request.META.get('REMOTE_ADDR')

class QRScanView(APIView):
    """
    POST /api/coupons/qr-scan/
    Body: { "qr_code_id": "abc123", "device_id": "device_123" }
    
    Backward-compatible: checks QROffer first, then falls back to
    MysteryCardQR and TShirtQRCode.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        qr_code_id = request.data.get('qr_code_id') or request.data.get('code')
        device_id = request.data.get('device_id', '')
        ip_address = self.get_client_ip(request)

        if not qr_code_id:
            return Response({
                'success': False,
                'message': 'QR code ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        # ── 1. DIGITAL QROFFER ──
        try:
            qr_offer = QROffer.objects.get(qr_code_id=qr_code_id)
        except QROffer.DoesNotExist:
            # Fallback to treasurehunt models
            return self._scan_treasurehunt_qr(request, qr_code_id, device_id, ip_address)

        if not qr_offer.is_valid():
            return Response({
                'success': False,
                'message': 'This offer has expired or reached its limit!'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Anti-fraud recent scan
        recent_scan = QRScanLog.objects.filter(
            qr_offer=qr_offer,
            device_id=device_id,
            scanned_at__gte=timezone.now() - timedelta(hours=24),
            is_used=False
        ).first()

        if recent_scan:
            return Response({
                'success': True,
                'reveal_type': qr_offer.reveal_type,
                'discount': recent_scan.discount_revealed,
                'coupon_code': recent_scan.coupon_code,
                'expires_at': recent_scan.expires_at,
                'title': qr_offer.title,
                'message': 'You already have an active discount!'
            })

        discount_value = qr_offer.get_random_discount()
        coupon_code = f"QR{secrets.token_urlsafe(6)[:8].upper()}"

        with transaction.atomic():
            coupon = Coupon.objects.create(
                code=coupon_code,
                description=f"QR Offer: {qr_offer.title}",
                discount_type='percent',
                discount_value=discount_value,
                max_uses=1,
                is_active=True,
                expires_at=timezone.now() + timedelta(minutes=qr_offer.scan_expiry_minutes)
            )
            qr_offer.scan_count += 1
            qr_offer.save()

            scan_log = QRScanLog.objects.create(
                qr_offer=qr_offer,
                user=request.user if request.user.is_authenticated else None,
                device_id=device_id,
                ip_address=ip_address,
                discount_revealed=discount_value,
                coupon_code=coupon_code,
                expires_at=timezone.now() + timedelta(minutes=qr_offer.scan_expiry_minutes)
            )

        return Response({
            'success': True,
            'reveal_type': qr_offer.reveal_type,
            'discount': discount_value,
            'coupon_code': coupon_code,
            'expires_at': scan_log.expires_at,
            'title': qr_offer.title,
            'message': f'🎉 You won {discount_value}% off!'
        })

    def _scan_treasurehunt_qr(self, request, code, device_id, ip_address):
        """Fallback: Mystery Card or T-Shirt QR"""
        
        # ── 2. MYSTERY CARD ──
        try:
            card = MysteryCardQR.objects.get(code=code)

            if card.is_used:
                return Response({
                    'success': False,
                    'message': 'This card has already been claimed!'
                }, status=status.HTTP_400_BAD_REQUEST)

            if not request.user.is_authenticated:
                return Response({
                    'success': False,
                    'requires_auth': True,
                    'message': 'Please login to claim this mystery reward!'
                }, status=status.HTTP_401_UNAUTHORIZED)

            card.is_used = True
            card.claimed_by = request.user
            card.claimed_at = timezone.now()
            card.save()

            if card.reward_type == 'arc':
                progress, _ = UserHuntProgress.objects.get_or_create(
                    user=request.user,
                    defaults={'current_level': 0, 'unlocked_arcs': []}
                )
                slug = card.arc_slug or 'founder'
                if slug not in progress.unlocked_arcs:
                    progress.unlocked_arcs.append(slug)
                    progress.save()

                return Response({
                    'success': True,
                    'type': 'mystery_card',
                    'reward_type': 'arc',
                    'arc_slug': slug,
                    'message': f'🌌 SECRET REVEALED! You unlocked the {slug.capitalize()} Arc!'
                })

            elif card.reward_type == 'coupon':
                coupon_code = f"MYST{secrets.token_urlsafe(4)[:6].upper()}"
                discount = card.discount_percentage or 10

                Coupon.objects.create(
                    code=coupon_code,
                    description="Mystery Box Reward",
                    discount_type='percent',
                    discount_value=discount,
                    max_uses=1,
                    is_active=True,
                    expires_at=timezone.now() + timedelta(days=7)
                )

                return Response({
                    'success': True,
                    'type': 'mystery_card',
                    'reward_type': 'coupon',
                    'coupon_code': coupon_code,
                    'discount': discount,
                    'message': f'🎉 SURPRISE! You won {discount}% OFF! Code: {coupon_code}'
                })

        except MysteryCardQR.DoesNotExist:
            pass

        # ── 3. T-SHIRT HUNT QR ──
        try:
            qr = TShirtQRCode.objects.get(secret_hash=code)

            if qr.is_activated:
                return Response({
                    'success': False,
                    'message': 'This T-Shirt QR is already claimed.'
                }, status=status.HTTP_400_BAD_REQUEST)

            if not request.user.is_authenticated:
                return Response({
                    'success': False,
                    'requires_auth': True,
                    'message': 'Please login to start your treasure hunt!'
                }, status=status.HTTP_401_UNAUTHORIZED)

            if hasattr(request.user, 'hunt_progress'):
                return Response({
                    'success': False,
                    'message': 'You already have an active treasure hunt.',
                    'current_level': request.user.hunt_progress.current_level
                }, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                qr.is_activated = True
                qr.activated_by = request.user
                qr.activated_at = timezone.now()
                qr.save()

                progress = UserHuntProgress.objects.create(
                    user=request.user,
                    tshirt_qr=qr,
                    current_level=1,
                    last_unlocked_at=timezone.now()
                )

                HuntLeaderboard.objects.create(
                    user=request.user,
                    progress=progress,
                    score=calculate_hunt_score(progress)
                )

            return Response({
                'success': True,
                'type': 'tshirt_hunt',
                'message': 'Treasure Hunt activated! Level 1 unlocked.',
                'current_level': 1
            })

        except TShirtQRCode.DoesNotExist:
            pass

        # Nothing matched
        return Response({
            'success': False,
            'message': 'Invalid QR Code!'
        }, status=status.HTTP_400_BAD_REQUEST)

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')
class AdminQROfferListCreateView(generics.ListCreateAPIView):
    """Admin: List/Create QR Offers"""
    serializer_class = QROfferSerializer
    permission_classes = [IsAdmin]
    queryset = QROffer.objects.all()

    def perform_create(self, serializer):
        instance = serializer.save()
        # Auto-generate QR image
        instance.generate_qr_image()


class AdminQROfferDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: Get/Update/Delete QR Offer"""
    serializer_class = QROfferSerializer
    permission_classes = [IsAdmin]
    queryset = QROffer.objects.all()
    lookup_field = 'qr_code_id'


class AdminQRScanLogsView(generics.ListAPIView):
    """Admin: View all scan logs"""
    serializer_class = QRScanLogSerializer
    permission_classes = [IsAdmin]
    queryset = QRScanLog.objects.all().select_related('qr_offer', 'user')