from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from django.contrib.auth import get_user_model

from .models import TShirtQRCode, HuntLocation, UserHuntProgress, HuntReward, HuntLeaderboard
from .serializers import (
    TShirtQRCodeSerializer, HuntLocationSerializer, 
    UserHuntProgressSerializer, QRActivateSerializer,
    LocationVerifySerializer, HuntRewardSerializer,
    LeaderboardSerializer
)
from .utils import validate_geofence, calculate_hunt_score
from .permissions import IsHuntParticipant, IsAdminOrReadOnly

User = get_user_model()

# ─── THROTTLE CLASSES ───
class QRScanThrottle(UserRateThrottle):
    rate = '5/minute'

class LocationVerifyThrottle(UserRateThrottle):
    rate = '3/minute'

# ═══════════════════════════════════════════════
# 1. QR CODE ACTIVATION (T-Shirt First Scan)
# ═══════════════════════════════════════════════
class QRActivateView(generics.GenericAPIView):
    """
    POST /api/hunt/activate/
    Body: { "code": "th-abc123" }

    First scan of T-shirt QR. Links QR to user account.
    Creates UserHuntProgress at Level 1.
    """
    serializer_class = QRActivateSerializer
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [QRScanThrottle]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        secret_hash = serializer.validated_data['code']
        user = request.user

        # 1. Find the QR code
        try:
            qr_code = TShirtQRCode.objects.select_related('order').get(
                secret_hash=secret_hash,
                is_activated=False  # Must not be already claimed
            )
        except TShirtQRCode.DoesNotExist:
            # Check if already claimed by someone else
            if TShirtQRCode.objects.filter(secret_hash=secret_hash, is_activated=True).exists():
                return Response(
                    {'error': 'This T-Shirt QR is already claimed by another user.', 
                     'code': 'ALREADY_CLAIMED'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response(
                {'error': 'Invalid QR code.', 'code': 'INVALID_QR'},
                status=status.HTTP_404_NOT_FOUND
            )

        # 2. Anti-sharing: Check if user already has a hunt in progress
        if hasattr(user, 'hunt_progress'):
            return Response(
                {'error': 'You already have an active treasure hunt.', 
                 'code': 'HUNT_EXISTS',
                 'current_level': user.hunt_progress.current_level},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Activate QR and create progress
        with transaction.atomic():
            qr_code.is_activated = True
            qr_code.activated_by = user
            qr_code.activated_at = timezone.now()
            qr_code.save()

            progress = UserHuntProgress.objects.create(
                user=user,
                tshirt_qr=qr_code,
                current_level=1,  # Unlocks Level 1
                last_unlocked_at=timezone.now()
            )

            # Create leaderboard entry
            HuntLeaderboard.objects.create(
                user=user,
                progress=progress,
                score=calculate_hunt_score(progress)
            )

        return Response({
            'success': True,
            'message': 'Treasure Hunt activated! Level 1 unlocked.',
            'progress': UserHuntProgressSerializer(progress).data
        }, status=status.HTTP_201_CREATED)


# ═══════════════════════════════════════════════
# 2. HUNT PROGRESS & DASHBOARD
# ═══════════════════════════════════════════════
class HuntProgressView(generics.RetrieveAPIView):
    """
    GET /api/hunt/progress/
    Returns current user's hunt progress, next clue, rewards.
    """
    serializer_class = UserHuntProgressSerializer
    permission_classes = [permissions.IsAuthenticated, IsHuntParticipant]

    def get_object(self):
        return self.request.user.hunt_progress


class HuntDashboardView(generics.GenericAPIView):
    """
    GET /api/hunt/dashboard/
    Full dashboard: progress + all locations with unlock status.
    """
    permission_classes = [permissions.IsAuthenticated, IsHuntParticipant]

    def get(self, request):
        user = request.user
        progress = user.hunt_progress

        # Get all locations with context for distance calculation
        locations = HuntLocation.objects.filter(is_active=True)
        location_serializer = HuntLocationSerializer(
            locations, 
            many=True, 
            context={'request': request}
        )

        return Response({
            'progress': UserHuntProgressSerializer(progress).data,
            'locations': location_serializer.data,
            'total_levels': 5,
            'levels_completed': progress.current_level
        })


# ═══════════════════════════════════════════════
# 3. LOCATION VERIFICATION (GPS + QR Scan)
# ═══════════════════════════════════════════════
class LocationVerifyView(generics.GenericAPIView):
    """
    POST /api/hunt/verify-location/
    Body: { "loc_secret": "loc-xyz", "user_lat": 13.0827, "user_long": 80.2707 }

    Validates:
    1. User is at correct level
    2. GPS coordinates within radius
    3. Location QR secret is valid
    4. Unlocks next level + generates reward coupon
    """
    serializer_class = LocationVerifySerializer
    permission_classes = [permissions.IsAuthenticated, IsHuntParticipant]
    throttle_classes = [LocationVerifyThrottle]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        progress = user.hunt_progress

        loc_secret = serializer.validated_data['loc_secret']
        user_lat = serializer.validated_data['user_lat']
        user_long = serializer.validated_data['user_long']

        # 1. Check if user is at correct level
        expected_level = progress.current_level
        if expected_level == 0:
            return Response(
                {'error': 'Activate your T-shirt QR first!', 'code': 'NOT_STARTED'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if expected_level > 5:
            return Response(
                {'error': 'Hunt already completed!', 'code': 'ALREADY_COMPLETED'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Find location by secret and level
        try:
            location = HuntLocation.objects.get(
                location_qr_secret=loc_secret,
                level=expected_level,
                is_active=True
            )
        except HuntLocation.DoesNotExist:
            return Response(
                {'error': 'Invalid location QR code.', 'code': 'INVALID_LOCATION'},
                status=status.HTTP_404_NOT_FOUND
            )

        # 3. GPS Fencing Validation
        geo_result = validate_geofence(
            user_lat, user_long,
            location.geo_lat, location.geo_long,
            location.geo_radius_meters
        )

        if not geo_result['is_valid']:
            return Response({
                'error': 'You are too far from the location!',
                'code': 'OUT_OF_RANGE',
                'distance_meters': geo_result['distance_meters'],
                'required_radius': geo_result['allowed_radius']
            }, status=status.HTTP_403_FORBIDDEN)

        # 4. Check if reward already claimed for this level
        if HuntReward.objects.filter(progress=progress, level=expected_level).exists():
            return Response(
                {'error': 'Reward already claimed for this level!', 'code': 'REWARD_CLAIMED'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 5. Unlock next level + Create reward
        with transaction.atomic():
            # Generate coupon from template
            coupon = None
            if location.reward_coupon_template:
                # Clone coupon for this user
                template = location.reward_coupon_template
                from coupons.models import Coupon  # Adjust import as per your app
                coupon = Coupon.objects.create(
                    code=f"HUNT-{expected_level}-{user.id.hex[:6].upper()}",
                    discount_type=template.discount_type,
                    discount_value=template.discount_value,
                    min_order=template.min_order,
                    max_uses=1,
                    used_count=0,
                    expires_at=timezone.now() + timezone.timedelta(days=7)
                )

            # Create reward record
            HuntReward.objects.create(
                user=user,
                progress=progress,
                level=expected_level,
                coupon=coupon
            )

            # Update progress
            progress.current_level = expected_level + 1
            progress.last_unlocked_at = timezone.now()

            if progress.current_level > 5:
                progress.completed_at = timezone.now()
                progress.total_time_minutes = int(
                    (timezone.now() - progress.started_at).total_seconds() // 60
                )

            progress.save()

            # Update leaderboard
            leaderboard, _ = HuntLeaderboard.objects.get_or_create(
                user=user,
                defaults={'progress': progress, 'score': 0}
            )
            leaderboard.progress = progress
            leaderboard.score = calculate_hunt_score(progress)
            leaderboard.save()

        return Response({
            'success': True,
            'message': f'Level {expected_level} completed! Level {expected_level + 1} unlocked.',
            'reward': {
                'level': expected_level,
                'coupon_code': coupon.code if coupon else None,
                'discount': str(coupon.discount_value) if coupon else None
            },
            'progress': UserHuntProgressSerializer(progress).data,
            'distance_verified': geo_result['distance_meters']
        })


# ═══════════════════════════════════════════════
# 4. LEADERBOARD
# ═══════════════════════════════════════════════
class LeaderboardView(generics.ListAPIView):
    """
    GET /api/hunt/leaderboard/?top=50
    Returns ranked list of hunters.
    """
    serializer_class = LeaderboardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        top = self.request.query_params.get('top', 50)
        try:
            top = int(top)
        except ValueError:
            top = 50
        return HuntLeaderboard.objects.filter(rank__gt=0).order_by('rank')[:top]


# ═══════════════════════════════════════════════
# 5. ADMIN: HUNT LOCATION CRUD
# ═══════════════════════════════════════════════
class HuntLocationListCreateView(generics.ListCreateAPIView):
    """
    GET/POST /api/hunt/admin/locations/
    Admin only: Manage hunt locations.
    """
    queryset = HuntLocation.objects.all()
    serializer_class = HuntLocationSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]

class HuntLocationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PUT/DELETE /api/hunt/admin/locations/<id>/
    """
    queryset = HuntLocation.objects.all()
    serializer_class = HuntLocationSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]


# ═══════════════════════════════════════════════
# 6. ADMIN: QR BATCH GENERATION
# ═══════════════════════════════════════════════
from rest_framework.decorators import api_view, permission_classes

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrReadOnly])
def generate_qr_batch(request):
    """
    POST /api/hunt/admin/generate-qr/
    Body: { "order_ids": ["uuid1", "uuid2"] }

    Generates QR codes for specific orders (T-shirt products).
    Call this after order confirmation for T-shirt purchases.
    """
    order_ids = request.data.get('order_ids', [])

    if not order_ids:
        return Response(
            {'error': 'No order IDs provided.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    from orders.models import Order  # Adjust import
    generated = []

    for order_id in order_ids:
        try:
            order = Order.objects.get(id=order_id)

            # Check if QR already exists
            if hasattr(order, 'tshirt_qr'):
                generated.append({
                    'order_id': str(order_id),
                    'status': 'already_exists',
                    'qr_secret': order.tshirt_qr.secret_hash
                })
                continue

            # Generate new QR
            from .utils import generate_unique_qr_secret, generate_qr_image
            secret = generate_unique_qr_secret()
            qr = TShirtQRCode.objects.create(
                order=order,
                secret_hash=secret
            )

            generated.append({
                'order_id': str(order_id),
                'status': 'created',
                'qr_secret': secret,
                'qr_url': f"{request.build_absolute_uri('/').rstrip('/')}/hunt/start?code={secret}"
            })

        except Order.DoesNotExist:
            generated.append({
                'order_id': str(order_id),
                'status': 'order_not_found'
            })

    return Response({
        'generated': generated,
        'total': len(generated)
    })


# ═══════════════════════════════════════════════
# 7. PUBLIC: CHECK QR STATUS (for printing/validation)
# ═══════════════════════════════════════════════
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def check_qr_status(request, secret_hash):
    """
    GET /api/hunt/qr-status/<secret_hash>/
    Public endpoint to check if QR is valid/claimed.
    Used by admin dashboard for QR printing verification.
    """
    try:
        qr = TShirtQRCode.objects.get(secret_hash=secret_hash)
        return Response({
            'exists': True,
            'is_activated': qr.is_activated,
            'activated_by': qr.activated_by.name if qr.activated_by else None,
            'created_at': qr.created_at
        })
    except TShirtQRCode.DoesNotExist:
        return Response(
            {'exists': False},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrReadOnly])
def admin_qr_list(request):
    qrs = TShirtQRCode.objects.select_related('order', 'activated_by').all().order_by('-created_at')
    data = [{
        'id': str(qr.id),
        'secret_hash': qr.secret_hash,
        'order_id': str(qr.order.id) if qr.order else None,
        'is_activated': qr.is_activated,
        'activated_by': qr.activated_by.name if qr.activated_by else None,
        'created_at': qr.created_at,
    } for qr in qrs]
    return Response({'count': len(data), 'results': data})

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrReadOnly])
def admin_dashboard_stats(request):
    return Response({
        'active_hunters': UserHuntProgress.objects.count(),
        'completed_hunts': UserHuntProgress.objects.filter(current_level__gte=5).count(),
        'total_qr': TShirtQRCode.objects.count(),
        'rewards_given': HuntReward.objects.count(),
        'level_progress': [UserHuntProgress.objects.filter(current_level=i).count() for i in range(1,6)],
        'top_hunters': [],
        'recent_activations': [],
    })