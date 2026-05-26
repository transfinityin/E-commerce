# from rest_framework import generics, status, permissions
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.response import Response
# from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
# from django.shortcuts import get_object_or_404
# from django.utils import timezone
# from django.db import transaction
# from django.contrib.auth import get_user_model

# from .models import TShirtQRCode, HuntLocation, UserHuntProgress, HuntReward, HuntLeaderboard
# from .serializers import (
#     TShirtQRCodeSerializer, HuntLocationSerializer, 
#     UserHuntProgressSerializer, QRActivateSerializer,
#     LocationVerifySerializer, HuntRewardSerializer,
#     LeaderboardSerializer
# )
# from .utils import validate_geofence, calculate_hunt_score
# from .permissions import IsHuntParticipant, IsAdminOrReadOnly

# User = get_user_model()

# # ─── THROTTLE CLASSES ───
# class QRScanThrottle(UserRateThrottle):
#     rate = '5/minute'

# class LocationVerifyThrottle(UserRateThrottle):
#     rate = '3/minute'

# # ═══════════════════════════════════════════════
# # 1. QR CODE ACTIVATION (T-Shirt First Scan)
# # ═══════════════════════════════════════════════
# class QRActivateView(generics.GenericAPIView):
#     """
#     POST /api/hunt/activate/
#     Body: { "code": "th-abc123" }

#     First scan of T-shirt QR. Links QR to user account.
#     Creates UserHuntProgress at Level 1.
#     """
#     serializer_class = QRActivateSerializer
#     permission_classes = [permissions.IsAuthenticated]
#     throttle_classes = [QRScanThrottle]

#     def post(self, request):
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)

#         secret_hash = serializer.validated_data['code']
#         user = request.user

#         # 1. Find the QR code
#         try:
#             qr_code = TShirtQRCode.objects.select_related('order').get(
#                 secret_hash=secret_hash,
#                 is_activated=False  # Must not be already claimed
#             )
#         except TShirtQRCode.DoesNotExist:
#             # Check if already claimed by someone else
#             if TShirtQRCode.objects.filter(secret_hash=secret_hash, is_activated=True).exists():
#                 return Response(
#                     {'error': 'This T-Shirt QR is already claimed by another user.', 
#                      'code': 'ALREADY_CLAIMED'},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
#             return Response(
#                 {'error': 'Invalid QR code.', 'code': 'INVALID_QR'},
#                 status=status.HTTP_404_NOT_FOUND
#             )

#         # 2. Anti-sharing: Check if user already has a hunt in progress
#         if hasattr(user, 'hunt_progress'):
#             return Response(
#                 {'error': 'You already have an active treasure hunt.', 
#                  'code': 'HUNT_EXISTS',
#                  'current_level': user.hunt_progress.current_level},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         # 3. Activate QR and create progress
#         with transaction.atomic():
#             qr_code.is_activated = True
#             qr_code.activated_by = user
#             qr_code.activated_at = timezone.now()
#             qr_code.save()

#             progress = UserHuntProgress.objects.create(
#                 user=user,
#                 tshirt_qr=qr_code,
#                 current_level=1,  # Unlocks Level 1
#                 last_unlocked_at=timezone.now()
#             )

#             # Create leaderboard entry
#             HuntLeaderboard.objects.create(
#                 user=user,
#                 progress=progress,
#                 score=calculate_hunt_score(progress)
#             )

#         return Response({
#             'success': True,
#             'message': 'Treasure Hunt activated! Level 1 unlocked.',
#             'progress': UserHuntProgressSerializer(progress).data
#         }, status=status.HTTP_201_CREATED)


# # ═══════════════════════════════════════════════
# # 2. HUNT PROGRESS & DASHBOARD
# # ═══════════════════════════════════════════════
# class HuntProgressView(generics.RetrieveAPIView):
#     """
#     GET /api/hunt/progress/
#     Returns current user's hunt progress, next clue, rewards.
#     """
#     serializer_class = UserHuntProgressSerializer
#     permission_classes = [permissions.IsAuthenticated, IsHuntParticipant]

#     def get_object(self):
#         return self.request.user.hunt_progress


# class HuntDashboardView(generics.GenericAPIView):
#     """
#     GET /api/hunt/dashboard/
#     Full dashboard: progress + all locations with unlock status.
#     """
#     permission_classes = [permissions.IsAuthenticated, IsHuntParticipant]

#     def get(self, request):
#         user = request.user
#         progress = user.hunt_progress

#         # Get all locations with context for distance calculation
#         locations = HuntLocation.objects.filter(is_active=True)
#         location_serializer = HuntLocationSerializer(
#             locations, 
#             many=True, 
#             context={'request': request}
#         )

#         return Response({
#             'progress': UserHuntProgressSerializer(progress).data,
#             'locations': location_serializer.data,
#             'total_levels': 5,
#             'levels_completed': progress.current_level
#         })


# # ═══════════════════════════════════════════════
# # 3. LOCATION VERIFICATION (GPS + QR Scan)
# # ═══════════════════════════════════════════════
# class LocationVerifyView(generics.GenericAPIView):
#     """
#     POST /api/hunt/verify-location/
#     Body: { "loc_secret": "loc-xyz", "user_lat": 13.0827, "user_long": 80.2707 }

#     Validates:
#     1. User is at correct level
#     2. GPS coordinates within radius
#     3. Location QR secret is valid
#     4. Unlocks next level + generates reward coupon
#     """
#     serializer_class = LocationVerifySerializer
#     permission_classes = [permissions.IsAuthenticated, IsHuntParticipant]
#     throttle_classes = [LocationVerifyThrottle]

#     def post(self, request):
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)

#         user = request.user
#         progress = user.hunt_progress

#         loc_secret = serializer.validated_data['loc_secret']
#         user_lat = serializer.validated_data['user_lat']
#         user_long = serializer.validated_data['user_long']

#         # 1. Check if user is at correct level
#         expected_level = progress.current_level
#         if expected_level == 0:
#             return Response(
#                 {'error': 'Activate your T-shirt QR first!', 'code': 'NOT_STARTED'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#         if expected_level > 5:
#             return Response(
#                 {'error': 'Hunt already completed!', 'code': 'ALREADY_COMPLETED'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         # 2. Find location by secret and level
#         try:
#             location = HuntLocation.objects.get(
#                 location_qr_secret=loc_secret,
#                 level=expected_level,
#                 is_active=True
#             )
#         except HuntLocation.DoesNotExist:
#             return Response(
#                 {'error': 'Invalid location QR code.', 'code': 'INVALID_LOCATION'},
#                 status=status.HTTP_404_NOT_FOUND
#             )

#         # 3. GPS Fencing Validation
#         geo_result = validate_geofence(
#             user_lat, user_long,
#             location.geo_lat, location.geo_long,
#             location.geo_radius_meters
#         )

#         if not geo_result['is_valid']:
#             return Response({
#                 'error': 'You are too far from the location!',
#                 'code': 'OUT_OF_RANGE',
#                 'distance_meters': geo_result['distance_meters'],
#                 'required_radius': geo_result['allowed_radius']
#             }, status=status.HTTP_403_FORBIDDEN)

#         # 4. Check if reward already claimed for this level
#         if HuntReward.objects.filter(progress=progress, level=expected_level).exists():
#             return Response(
#                 {'error': 'Reward already claimed for this level!', 'code': 'REWARD_CLAIMED'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         # 5. Unlock next level + Create reward
#         with transaction.atomic():
#             # Generate coupon from template
#             coupon = None
#             if location.reward_coupon_template:
#                 # Clone coupon for this user
#                 template = location.reward_coupon_template
#                 from coupons.models import Coupon  # Adjust import as per your app
#                 coupon = Coupon.objects.create(
#                     code=f"HUNT-{expected_level}-{user.id.hex[:6].upper()}",
#                     discount_type=template.discount_type,
#                     discount_value=template.discount_value,
#                     min_order=template.min_order,
#                     max_uses=1,
#                     used_count=0,
#                     expires_at=timezone.now() + timezone.timedelta(days=7)
#                 )

#             # Create reward record
#             HuntReward.objects.create(
#                 user=user,
#                 progress=progress,
#                 level=expected_level,
#                 coupon=coupon
#             )

#             # Update progress
#             progress.current_level = expected_level + 1
#             progress.last_unlocked_at = timezone.now()

#             if progress.current_level > 5:
#                 progress.completed_at = timezone.now()
#                 progress.total_time_minutes = int(
#                     (timezone.now() - progress.started_at).total_seconds() // 60
#                 )

#             progress.save()

#             # Update leaderboard
#             leaderboard, _ = HuntLeaderboard.objects.get_or_create(
#                 user=user,
#                 defaults={'progress': progress, 'score': 0}
#             )
#             leaderboard.progress = progress
#             leaderboard.score = calculate_hunt_score(progress)
#             leaderboard.save()

#         return Response({
#             'success': True,
#             'message': f'Level {expected_level} completed! Level {expected_level + 1} unlocked.',
#             'reward': {
#                 'level': expected_level,
#                 'coupon_code': coupon.code if coupon else None,
#                 'discount': str(coupon.discount_value) if coupon else None
#             },
#             'progress': UserHuntProgressSerializer(progress).data,
#             'distance_verified': geo_result['distance_meters']
#         })


# # ═══════════════════════════════════════════════
# # 4. LEADERBOARD
# # ═══════════════════════════════════════════════
# class LeaderboardView(generics.ListAPIView):
#     """
#     GET /api/hunt/leaderboard/?top=50
#     Returns ranked list of hunters.
#     """
#     serializer_class = LeaderboardSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def get_queryset(self):
#         top = self.request.query_params.get('top', 50)
#         try:
#             top = int(top)
#         except ValueError:
#             top = 50
#         return HuntLeaderboard.objects.filter(rank__gt=0).order_by('rank')[:top]


# # ═══════════════════════════════════════════════
# # 5. ADMIN: HUNT LOCATION CRUD
# # ═══════════════════════════════════════════════
# class HuntLocationListCreateView(generics.ListCreateAPIView):
#     """
#     GET/POST /api/hunt/admin/locations/
#     Admin only: Manage hunt locations.
#     """
#     queryset = HuntLocation.objects.all()
#     serializer_class = HuntLocationSerializer
#     permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]

# class HuntLocationDetailView(generics.RetrieveUpdateDestroyAPIView):
#     """
#     GET/PUT/DELETE /api/hunt/admin/locations/<id>/
#     """
#     queryset = HuntLocation.objects.all()
#     serializer_class = HuntLocationSerializer
#     permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]


# # ═══════════════════════════════════════════════
# # 6. ADMIN: QR BATCH GENERATION
# # ═══════════════════════════════════════════════
# from rest_framework.decorators import api_view, permission_classes

# @api_view(['POST'])
# @permission_classes([permissions.IsAuthenticated, IsAdminOrReadOnly])
# def generate_qr_batch(request):
#     """
#     POST /api/hunt/admin/generate-qr/
#     Body: { "order_ids": ["uuid1", "uuid2"] }

#     Generates QR codes for specific orders (T-shirt products).
#     Call this after order confirmation for T-shirt purchases.
#     """
#     order_ids = request.data.get('order_ids', [])

#     if not order_ids:
#         return Response(
#             {'error': 'No order IDs provided.'},
#             status=status.HTTP_400_BAD_REQUEST
#         )

#     from orders.models import Order  # Adjust import
#     generated = []

#     for order_id in order_ids:
#         try:
#             order = Order.objects.get(id=order_id)

#             # Check if QR already exists
#             if hasattr(order, 'tshirt_qr'):
#                 generated.append({
#                     'order_id': str(order_id),
#                     'status': 'already_exists',
#                     'qr_secret': order.tshirt_qr.secret_hash
#                 })
#                 continue

#             # Generate new QR
#             from .utils import generate_unique_qr_secret, generate_qr_image
#             secret = generate_unique_qr_secret()
#             qr = TShirtQRCode.objects.create(
#                 order=order,
#                 secret_hash=secret
#             )

#             generated.append({
#                 'order_id': str(order_id),
#                 'status': 'created',
#                 'qr_secret': secret,
#                 'qr_url': f"{request.build_absolute_uri('/').rstrip('/')}/hunt/start?code={secret}"
#             })

#         except Order.DoesNotExist:
#             generated.append({
#                 'order_id': str(order_id),
#                 'status': 'order_not_found'
#             })

#     return Response({
#         'generated': generated,
#         'total': len(generated)
#     })


# # ═══════════════════════════════════════════════
# # 7. PUBLIC: CHECK QR STATUS (for printing/validation)
# # ═══════════════════════════════════════════════
# @api_view(['GET'])
# @permission_classes([permissions.AllowAny])
# def check_qr_status(request, secret_hash):
#     """
#     GET /api/hunt/qr-status/<secret_hash>/
#     Public endpoint to check if QR is valid/claimed.
#     Used by admin dashboard for QR printing verification.
#     """
#     try:
#         qr = TShirtQRCode.objects.get(secret_hash=secret_hash)
#         return Response({
#             'exists': True,
#             'is_activated': qr.is_activated,
#             'activated_by': qr.activated_by.name if qr.activated_by else None,
#             'created_at': qr.created_at
#         })
#     except TShirtQRCode.DoesNotExist:
#         return Response(
#             {'exists': False},
#             status=status.HTTP_404_NOT_FOUND
#         )


# @api_view(['GET'])
# @permission_classes([permissions.IsAuthenticated, IsAdminOrReadOnly])
# def admin_qr_list(request):
#     qrs = TShirtQRCode.objects.select_related('order', 'activated_by').all().order_by('-created_at')
#     data = [{
#         'id': str(qr.id),
#         'secret_hash': qr.secret_hash,
#         'order_id': str(qr.order.id) if qr.order else None,
#         'is_activated': qr.is_activated,
#         'activated_by': qr.activated_by.name if qr.activated_by else None,
#         'created_at': qr.created_at,
#     } for qr in qrs]
#     return Response({'count': len(data), 'results': data})

# @api_view(['GET'])
# @permission_classes([permissions.IsAuthenticated, IsAdminOrReadOnly])
# def admin_dashboard_stats(request):
#     return Response({
#         'active_hunters': UserHuntProgress.objects.count(),
#         'completed_hunts': UserHuntProgress.objects.filter(current_level__gte=5).count(),
#         'total_qr': TShirtQRCode.objects.count(),
#         'rewards_given': HuntReward.objects.count(),
#         'level_progress': [UserHuntProgress.objects.filter(current_level=i).count() for i in range(1,6)],
#         'top_hunters': [],
#         'recent_activations': [],
#     })


# """
# TRANSFINITY Treasure Hunt - Django REST Views
# Path: backend/apps/treasurehunt/views.py
# """
# from rest_framework import viewsets, status
# from rest_framework.decorators import action
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, AllowAny
# from django.shortcuts import get_object_or_404
# from .models import Arc, ShipPath, Treasure, TreasureClaim, FounderProgress
# from .serializers import (
#     ArcSerializer, ArcDetailSerializer, ShipPathSerializer,
#     FounderProgressSerializer
# )


# class ArcViewSet(viewsets.ReadOnlyModelViewSet):
#     queryset = Arc.objects.all().order_by('arc_number')
#     permission_classes = [AllowAny]
#     lookup_field = 'arc_key'
    
#     def get_serializer_class(self):
#         if self.action == 'retrieve':
#             return ArcDetailSerializer
#         return ArcSerializer
    
#     @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
#     def visit(self, request, arc_key=None):
#         arc = self.get_object()
#         progress, _ = FounderProgress.objects.get_or_create(user=request.user)
        
#         if hasattr(request.user, 'is_arc_unlocked') and not request.user.is_arc_unlocked(arc.arc_key):
#             return Response({'error': 'Arc not unlocked'}, status=status.HTTP_403_FORBIDDEN)
        
#         progress.visit_arc(arc)
#         progress.current_arc = arc
#         progress.save()
        
#         return Response({
#             'message': f'Welcome to {arc.name}',
#             'xp_gained': 50,
#             'current_xp': request.user.xp,
#         })
    
#     @action(detail=True, methods=['get'])
#     def treasures(self, request, arc_key=None):
#         arc = self.get_object()
#         treasures = arc.treasures.filter(is_active=True)
        
#         data = []
#         for t in treasures:
#             is_claimed = False
#             if request.user.is_authenticated:
#                 is_claimed = TreasureClaim.objects.filter(treasure=t, user=request.user).exists()
            
#             data.append({
#                 'id': str(t.id),
#                 'name': t.name,
#                 'type': t.treasure_type,
#                 'map_x': t.map_x,
#                 'map_y': t.map_y,
#                 'is_claimed': is_claimed,
#                 'is_available': t.is_available,
#                 'clue_text': t.clue_text if is_claimed else None,
#             })
        
#         return Response(data)
    
#     @action(detail=True, methods=['get'])
#     def products(self, request, arc_key=None):
#         arc = self.get_object()
#         products = arc.products.filter(is_active=True)
        
#         data = []
#         for p in products:
#             primary_image = None
#             primary = p.images.filter(is_primary=True).first()
#             if primary:
#                 primary_image = primary.image
            
#             data.append({
#                 'id': str(p.id),
#                 'name': p.name,
#                 'slug': p.slug,
#                 'price': str(p.price),
#                 'effective_price': str(p.effective_price),
#                 'stock': p.stock,
#                 'is_limited_drop': p.is_limited_drop,
#                 'primary_image': primary_image,
#             })
        
#         return Response(data)


# class ShipPathViewSet(viewsets.ReadOnlyModelViewSet):
#     queryset = ShipPath.objects.filter(is_active=True)
#     serializer_class = ShipPathSerializer
#     permission_classes = [AllowAny]


# class TreasureViewSet(viewsets.ViewSet):
#     permission_classes = [IsAuthenticated]
    
#     @action(detail=True, methods=['post'])
#     def claim(self, request, pk=None):
#         treasure = get_object_or_404(Treasure, pk=pk)
        
#         if TreasureClaim.objects.filter(treasure=treasure, user=request.user).exists():
#             return Response({'error': 'Already claimed'}, status=status.HTTP_400_BAD_REQUEST)
        
#         if not treasure.is_available:
#             return Response({'error': 'Treasure no longer available'}, status=status.HTTP_400_BAD_REQUEST)
        
#         if hasattr(request.user, 'is_arc_unlocked') and not request.user.is_arc_unlocked(treasure.arc.arc_key):
#             return Response({'error': 'Arc not unlocked'}, status=status.HTTP_403_FORBIDDEN)
        
#         claim = TreasureClaim.objects.create(treasure=treasure, user=request.user)
        
#         progress, _ = FounderProgress.objects.get_or_create(user=request.user)
#         progress.discover_treasure(treasure)
        
#         reward_applied = self._apply_reward(request.user, treasure)
        
#         return Response({
#             'message': f'Treasure found: {treasure.name}!',
#             'reward': treasure.reward_value,
#             'reward_applied': reward_applied,
#             'xp_gained': 200,
#         })
    
#     def _apply_reward(self, user, treasure):
#         if treasure.treasure_type == 'xp':
#             amount = treasure.reward_data.get('amount', 500)
#             user.add_xp(amount)
#             return {'type': 'xp', 'amount': amount}
#         elif treasure.treasure_type == 'discount':
#             return {'type': 'discount', 'code': treasure.reward_data.get('code')}
#         return {'type': treasure.treasure_type}


# class MapViewSet(viewsets.ViewSet):
#     permission_classes = [AllowAny]
    
#     @action(detail=False, methods=['get'])
#     def world(self, request):
#         arcs = Arc.objects.all().order_by('arc_number')
#         paths = ShipPath.objects.filter(is_active=True)
        
#         user_progress = None
#         if request.user.is_authenticated:
#             progress, _ = FounderProgress.objects.get_or_create(user=request.user)
#             user_progress = {
#                 'current_arc': progress.current_arc.arc_number if progress.current_arc else 1,
#                 'rank': request.user.rank,
#                 'xp': request.user.xp,
#                 'unlocked_arcs': getattr(request.user, 'unlocked_arcs', []),
#                 'secrets_found': progress.secrets_found,
#                 'total_distance': progress.total_distance_traveled,
#             }
        
#         arc_serializer = ArcSerializer(arcs, many=True, context={'request': request})
#         path_serializer = ShipPathSerializer(paths, many=True)
        
#         return Response({
#             'arcs': arc_serializer.data,
#             'paths': path_serializer.data,
#             'user_progress': user_progress,
#             'total_arcs': 12,
#             'unlocked_count': arcs.filter(is_unlocked=True).count(),
#         })


# class FounderProgressViewSet(viewsets.ViewSet):
#     permission_classes = [IsAuthenticated]
    
#     @action(detail=False, methods=['get'])
#     def me(self, request):
#         progress, _ = FounderProgress.objects.get_or_create(user=request.user)
#         serializer = FounderProgressSerializer(progress)
        
#         next_rank_info = None
#         if hasattr(request.user, 'get_next_rank_info'):
#             next_rank_info = request.user.get_next_rank_info()
        
#         return Response({
#             'progress': serializer.data,
#             'rank': request.user.rank,
#             'xp': request.user.xp,
#             'next_rank': next_rank_info,
#             'unlocked_arcs': getattr(request.user, 'unlocked_arcs', []),
#         })






"""
TRANSFINITY Treasure Hunt - Clean Django REST Views
Path: backend/apps/treasurehunt/views.py

NO MODEL DEFINITIONS HERE - import from models.py only.
"""

from apps.treasurehunt.utils import calculate_hunt_score
from rest_framework import viewsets, status, generics, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from django.shortcuts import get_object_or_404
from django.core.cache import cache
from django.db.models import Count, Sum
from django.utils import timezone
from django.db import transaction
from django.conf import settings
from .models import (
    Arc, ShipPath, Treasure, TreasureClaim,
    FounderProgress, CommunityUnlockProgress, PurchaseLog,
    StorySegment, Challenge, Reward,
    TShirtQRCode, HuntLocation, UserHuntProgress,
    HuntReward, HuntLeaderboard
)
from .serializers import (
    ArcSerializer, ArcDetailSerializer, ShipPathSerializer,
    FounderProgressSerializer, TreasureSerializer,
    CommunityProgressSerializer, PurchaseLogSerializer,
    QRActivateSerializer,HuntLocationSerializer,UserHuntProgressSerializer, HuntRewardSerializer, LeaderboardSerializer
)
from .permissions import IsAdminOrReadOnly


# ═════════════════════════════════════════════════════════════════
# THROTTLE CLASSES
# ═════════════════════════════════════════════════════════════════

class ArcThrottle(UserRateThrottle):
    rate = '60/minute'

class TreasureThrottle(UserRateThrottle):
    rate = '10/minute'

class QRScanThrottle(UserRateThrottle):
    rate = '5/minute'


# ═════════════════════════════════════════════════════════════════
# ARC VIEWSET
# ═════════════════════════════════════════════════════════════════

class ArcViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Arc.objects.filter(is_active=True).order_by('arc_number')
    serializer_class = ArcSerializer
    lookup_field = 'arc_key'
    throttle_classes = [ArcThrottle]
    permission_classes = [permissions.AllowAny]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ArcDetailSerializer
        return ArcSerializer

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def visit(self, request, arc_key=None):
        arc = self.get_object()
        progress, _ = FounderProgress.objects.get_or_create(user=request.user)

        if arc.arc_number > 1:
            unlocked = False
            if hasattr(request.user, 'is_arc_unlocked'):
                unlocked = request.user.is_arc_unlocked(arc.arc_key)
            elif hasattr(request.user, 'founder_progress'):
                unlocked = arc in request.user.founder_progress.visited_arcs.all()

            if not unlocked and arc.arc_key not in getattr(request.user, 'unlocked_arcs', []):
                return Response(
                    {'error': 'Arc not unlocked yet.'},
                    status=status.HTTP_403_FORBIDDEN
                )

        progress.visit_arc(arc)
        if not progress.current_arc or arc.arc_number > (progress.current_arc.arc_number or 0):
            progress.current_arc = arc

        from math import sqrt
        if progress.current_arc and progress.current_arc != arc:
            distance = sqrt(
                (arc.map_x - progress.current_arc.map_x) ** 2 +
                (arc.map_y - progress.current_arc.map_y) ** 2
            )
            progress.total_distance_traveled += distance

        progress.save(update_fields=['current_arc', 'total_distance_traveled'])

        return Response({
            'success': True,
            'message': 'Welcome to ' + arc.name,
            'arc': ArcDetailSerializer(arc, context={'request': request}).data,
            'xp_gained': 50,
            'progress': FounderProgressSerializer(progress).data
        })

    @action(detail=True, methods=['get'])
    def treasures(self, request, arc_key=None):
        arc = self.get_object()
        treasures = arc.treasures.filter(is_active=True)
        data = []
        for t in treasures:
            is_claimed = False
            if request.user.is_authenticated:
                is_claimed = TreasureClaim.objects.filter(treasure=t, user=request.user).exists()
            data.append({
                'id': str(t.id),
                'name': t.name,
                'type': t.treasure_type,
                'map_x': t.map_x,
                'map_y': t.map_y,
                'is_claimed': is_claimed,
                'is_available': t.is_available,
                'clue_text': t.clue_text if is_claimed else None,
            })
        return Response(data)

    @action(detail=True, methods=['get'])
    def products(self, request, arc_key=None):
        arc = self.get_object()
        products = arc.products.filter(is_active=True)
        data = []
        for p in products:
            primary_image = None
            if hasattr(p, 'images'):
                primary = p.images.filter(is_primary=True).first()
                if primary and primary.image:
                    try:
                        primary_image = request.build_absolute_uri(primary.image.url)
                    except Exception:
                        pass
            data.append({
                'id': str(p.id),
                'name': p.name,
                'slug': getattr(p, 'slug', ''),
                'price': str(p.price),
                'effective_price': str(getattr(p, 'effective_price', p.price)),
                'stock': getattr(p, 'stock', 0),
                'is_limited_drop': getattr(p, 'is_limited_drop', False),
                'primary_image': primary_image,
            })
        return Response(data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def complete_challenge(self, request, arc_key=None):
        arc = self.get_object()
        challenge_id = request.data.get('challenge_id')
        if not challenge_id:
            return Response({'error': 'challenge_id required'}, status=400)

        challenge = get_object_or_404(Challenge, id=challenge_id, arc=arc)
        completed = getattr(request.user, 'completed_challenges', {})
        if isinstance(completed, dict) and str(challenge.id) in completed:
            return Response({'error': 'Challenge already completed'}, status=400)

        if hasattr(request.user, 'complete_challenge'):
            request.user.complete_challenge(challenge.id)

        xp_earned = 0
        if hasattr(request.user, 'add_xp'):
            xp_earned = request.user.add_xp(challenge.xp_reward)

        all_challenges = Challenge.objects.filter(arc=arc, is_active=True)
        user_completed = getattr(request.user, 'completed_challenges', {})
        all_done = all(str(c.id) in user_completed for c in all_challenges)

        return Response({
            'success': True,
            'xp_earned': xp_earned,
            'challenge_completed': True,
            'all_challenges_completed': all_done,
        })


# ═════════════════════════════════════════════════════════════════
# SHIP PATH VIEWSET
# ═════════════════════════════════════════════════════════════════

class ShipPathViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ShipPath.objects.filter(is_active=True)
    serializer_class = ShipPathSerializer
    permission_classes = [permissions.AllowAny]


# ═════════════════════════════════════════════════════════════════
# TREASURE VIEWSET
# ═════════════════════════════════════════════════════════════════

class TreasureViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [TreasureThrottle]

    @action(detail=True, methods=['post'])
    def claim(self, request, pk=None):
        treasure = get_object_or_404(Treasure, pk=pk)

        if TreasureClaim.objects.filter(treasure=treasure, user=request.user).exists():
            return Response({'error': 'Already claimed'}, status=400)

        if not treasure.is_available:
            return Response({'error': 'Treasure no longer available'}, status=400)

        if treasure.arc and treasure.arc.arc_number > 1:
            unlocked = False
            if hasattr(request.user, 'is_arc_unlocked'):
                unlocked = request.user.is_arc_unlocked(treasure.arc.arc_key)
            elif hasattr(request.user, 'founder_progress'):
                unlocked = treasure.arc in request.user.founder_progress.visited_arcs.all()
            if not unlocked:
                return Response({'error': 'Arc not unlocked'}, status=403)

        TreasureClaim.objects.create(treasure=treasure, user=request.user)
        progress, _ = FounderProgress.objects.get_or_create(user=request.user)
        progress.discover_treasure(treasure)

        reward_applied = self._apply_reward(request.user, treasure)
        return Response({
            'success': True,
            'message': 'Treasure found: ' + treasure.name + '!',
            'reward': treasure.reward_value,
            'reward_applied': reward_applied,
            'xp_gained': treasure.xp_reward,
        })

    def _apply_reward(self, user, treasure):
        if treasure.treasure_type == 'xp':
            amount = treasure.reward_data.get('amount', 500)
            if hasattr(user, 'add_xp'):
                user.add_xp(amount)
            return {'type': 'xp', 'amount': amount}
        elif treasure.treasure_type == 'discount':
            return {'type': 'discount', 'code': treasure.reward_data.get('code')}
        return {'type': treasure.treasure_type}


# ═════════════════════════════════════════════════════════════════
# MAP VIEWSET
# ═════════════════════════════════════════════════════════════════

class MapViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['get'])
    def world(self, request):
        cache_key = 'world_map_data'
        cached = cache.get(cache_key)
        if cached and not request.user.is_authenticated:
            return Response(cached)

        arcs = Arc.objects.filter(is_active=True).order_by('arc_number')
        paths = ShipPath.objects.filter(is_active=True)

        user_progress = None
        if request.user.is_authenticated:
            progress, _ = FounderProgress.objects.get_or_create(user=request.user)
            unlocked_arcs = []
            if hasattr(request.user, 'unlocked_arcs'):
                unlocked_arcs = request.user.unlocked_arcs
            else:
                unlocked_arcs = [a.arc_key for a in progress.visited_arcs.all()]
            user_progress = {
                'current_arc': progress.current_arc.arc_number if progress.current_arc else 1,
                'rank': getattr(request.user, 'rank', 'wanderer'),
                'xp': getattr(request.user, 'xp', 0),
                'unlocked_arcs': unlocked_arcs,
                'secrets_found': progress.secrets_found,
                'total_distance': round(progress.total_distance_traveled, 1),
            }

        arc_data = ArcSerializer(arcs, many=True, context={'request': request}).data
        path_data = ShipPathSerializer(paths, many=True).data

        community = CommunityUnlockProgress.objects.select_related('arc').all()
        community_data = []
        for cp in community:
            community_data.append({
                'arc_key': cp.arc.arc_key,
                'arc_number': cp.arc.arc_number,
                'percentage': cp.percentage,
                'progress_percentage': cp.progress_percentage,
                'current_purchases': cp.current_purchases,
                'target_purchases': cp.target_purchases,
                'is_unlocked': cp.is_unlocked,
                'contributors': len(cp.contributing_users),
            })

        response_data = {
            'arcs': arc_data,
            'paths': path_data,
            'user_progress': user_progress,
            'community_progress': community_data,
            'total_arcs': arcs.count(),
            'unlocked_count': arcs.filter(is_unlocked=True).count(),
        }
        cache.set(cache_key, response_data, timeout=300)
        return Response(response_data)


# ═════════════════════════════════════════════════════════════════
# FOUNDER PROGRESS VIEWSET
# ═════════════════════════════════════════════════════════════════

class FounderProgressViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def me(self, request):
        progress, _ = FounderProgress.objects.get_or_create(user=request.user)
        serializer = FounderProgressSerializer(progress)
        next_rank = None
        if hasattr(request.user, 'get_next_rank_info'):
            next_rank = request.user.get_next_rank_info()
        unlocked = []
        if hasattr(request.user, 'unlocked_arcs'):
            unlocked = request.user.unlocked_arcs
        else:
            unlocked = [a.arc_key for a in progress.visited_arcs.all()]
        return Response({
            'progress': serializer.data,
            'rank': getattr(request.user, 'rank', 'wanderer'),
            'xp': getattr(request.user, 'xp', 0),
            'next_rank': next_rank,
            'unlocked_arcs': unlocked,
        })

    @action(detail=False, methods=['post'])
    def enter_secret(self, request):
        secret_code = request.data.get('secret_code', '').strip().upper()
        if not secret_code:
            return Response({'error': 'Secret code required'}, status=400)

        arc = Arc.objects.filter(unlock_secret_code=secret_code, is_active=True).first()
        if arc:
            progress, _ = FounderProgress.objects.get_or_create(user=request.user)
            if arc not in progress.visited_arcs.all():
                progress.visit_arc(arc)
                return Response({
                    'success': True,
                    'type': 'arc_unlocked',
                    'arc': ArcSerializer(arc, context={'request': request}).data,
                    'message': 'Unlocked: ' + arc.name + '!'
                })
            return Response({'error': 'Arc already unlocked'}, status=400)

        treasure = Treasure.objects.filter(secret_code=secret_code, is_active=True).first()
        if treasure:
            if TreasureClaim.objects.filter(treasure=treasure, user=request.user).exists():
                return Response({'error': 'Treasure already claimed'}, status=400)
            TreasureClaim.objects.create(treasure=treasure, user=request.user)
            progress, _ = FounderProgress.objects.get_or_create(user=request.user)
            progress.discover_treasure(treasure)
            return Response({
                'success': True,
                'type': 'treasure_found',
                'treasure': TreasureSerializer(treasure).data,
                'xp_gained': treasure.xp_reward,
                'message': 'Found: ' + treasure.name + '! +' + str(treasure.xp_reward) + ' XP'
            })

        return Response({'error': 'Invalid secret code'}, status=400)


# ═════════════════════════════════════════════════════════════════
# COMMUNITY PROGRESS API VIEWS
# ═════════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def community_progress(request):
    progress = CommunityUnlockProgress.objects.select_related('arc').all()
    data = []
    for cp in progress:
        data.append({
            'arc_key': cp.arc.arc_key,
            'arc_name': cp.arc.name,
            'arc_number': cp.arc.arc_number,
            'percentage': cp.percentage,
            'progress_percentage': cp.progress_percentage,
            'current_sales': cp.current_sales,
            'sales_target': cp.sales_target,
            'current_purchases': cp.current_purchases,
            'target_purchases': cp.target_purchases,
            'is_unlocked': cp.is_unlocked,
            'contributors': len(cp.contributing_users),
            'milestones': {
                '25': cp.milestone_25,
                '50': cp.milestone_50,
                '75': cp.milestone_75,
                '90': cp.milestone_90,
            }
        })
    return Response(data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def arc_community_progress(request, arc_key):
    arc = get_object_or_404(Arc, arc_key=arc_key)
    progress, _ = CommunityUnlockProgress.objects.get_or_create(
        arc=arc,
        defaults={
            'target_purchases': arc.unlock_threshold or arc.sales_target or 100,
            'sales_target': arc.sales_target or 1000,
        }
    )
    return Response(CommunityProgressSerializer(progress).data)


# ═════════════════════════════════════════════════════════════════
# LEADERBOARD
# ═════════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def leaderboard(request):
    top = request.query_params.get('top', 50)
    try:
        top = int(top)
    except ValueError:
        top = 50

    from django.contrib.auth import get_user_model
    User = get_user_model()

    users = User.objects.filter(
        founder_progress__isnull=False
    ).select_related('founder_progress').order_by('-xp')[:top]

    data = []
    for i, user in enumerate(users, 1):
        progress = getattr(user, 'founder_progress', None)
        data.append({
            'rank': i,
            'username': getattr(user, 'username', user.email),
            'name': getattr(user, 'name', ''),
            'xp': getattr(user, 'xp', 0),
            'rank_title': getattr(user, 'rank', 'wanderer'),
            'arcs_unlocked': progress.visited_arcs.count() if progress else 0,
            'secrets_found': progress.secrets_found if progress else 0,
            'distance': round(progress.total_distance_traveled, 1) if progress else 0,
        })
    return Response(data)


# ═════════════════════════════════════════════════════════════════
# COMMUNITY STATS
# ═════════════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def community_stats(request):
    from django.contrib.auth import get_user_model
    User = get_user_model()

    total_players = FounderProgress.objects.count()
    total_purchases = PurchaseLog.objects.filter(status='completed').count()
    total_xp = User.objects.aggregate(total=Sum('xp'))['total'] or 0
    total_secrets = TreasureClaim.objects.count()
    total_distance = FounderProgress.objects.aggregate(total=Sum('total_distance_traveled'))['total'] or 0
    arcs_unlocked = Arc.objects.filter(community_progress__is_unlocked=True).count()

    top_contributors = []
    try:
        contributors = PurchaseLog.objects.filter(
            status='completed'
        ).values('user').annotate(count=Count('id')).order_by('-count')[:10]
        for c in contributors:
            try:
                user = User.objects.get(id=c['user'])
                top_contributors.append({
                    'username': getattr(user, 'username', user.email),
                    'purchases': c['count']
                })
            except User.DoesNotExist:
                continue
    except Exception:
        pass

    return Response({
        'total_players': total_players,
        'total_purchases': total_purchases,
        'total_xp_earned': total_xp,
        'total_secrets_found': total_secrets,
        'total_distance_traveled': round(total_distance, 1),
        'arcs_unlocked_by_community': arcs_unlocked,
        'arcs_total': Arc.objects.filter(is_active=True).count(),
        'top_contributors': top_contributors,
    })


# ═════════════════════════════════════════════════════════════════
# PURCHASE WEBHOOK
# ═════════════════════════════════════════════════════════════════

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def purchase_webhook(request):
    try:
        data = request.data
        order_id = data.get('order_id')
        user_id = data.get('user_id')
        amount = data.get('amount')
        status_val = data.get('status', 'pending')

        if not all([order_id, user_id, amount]):
            return Response(
                {'error': 'Missing required fields: order_id, user_id, amount'},
                status=status.HTTP_400_BAD_REQUEST
            )

        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = get_object_or_404(User, id=user_id)

        purchase, created = PurchaseLog.objects.update_or_create(
            order_id=order_id,
            defaults={
                'user': user,
                'amount': amount,
                'status': status_val,
                'items': data.get('items', []),
            }
        )

        return Response({
            'success': True,
            'purchase_id': str(purchase.id),
            'created': created,
            'status': purchase.status,
        })

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ═════════════════════════════════════════════════════════════════
# LEGACY: T-SHIRT QR HUNT VIEWS
# ═════════════════════════════════════════════════════════════════

# class QRActivateView(generics.GenericAPIView):
#     permission_classes = [permissions.IsAuthenticated]
#     throttle_classes = [QRScanThrottle]

#     def post(self, request):
#         serializer = QRActivateSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         secret_hash = serializer.validated_data['code']
#         user = request.user

#         try:
#             qr_code = TShirtQRCode.objects.select_related('order').get(
#                 secret_hash=secret_hash,
#                 is_activated=False
#             )
#         except TShirtQRCode.DoesNotExist:
#             if TShirtQRCode.objects.filter(secret_hash=secret_hash, is_activated=True).exists():
#                 return Response(
#                     {'error': 'This T-Shirt QR is already claimed.', 'code': 'ALREADY_CLAIMED'},
#                     status=400
#                 )
#             return Response({'error': 'Invalid QR code.', 'code': 'INVALID_QR'}, status=404)

#         if hasattr(user, 'hunt_progress'):
#             return Response(
#                 {'error': 'You already have an active treasure hunt.', 'code': 'HUNT_EXISTS'},
#                 status=400
#             )

#         with transaction.atomic():
#             qr_code.is_activated = True
#             qr_code.activated_by = user
#             qr_code.activated_at = timezone.now()
#             qr_code.save()

#             progress = UserHuntProgress.objects.create(  # ✅ once, save the reference
#                 user=user,
#                 tshirt_qr=qr_code,
#                 current_level=1,
#                 last_unlocked_at=timezone.now()
#             )

#             HuntLeaderboard.objects.get_or_create(
#                 user=user,
#                 defaults={"score": 0, "progress": progress}  # ✅ use same progress object
#             )

#         return Response({
#             'success': True,
#             'message': 'Treasure Hunt activated! Level 1 unlocked.',
#         }, status=201)
        
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


class HuntProgressView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            progress = request.user.hunt_progress
            return Response({
                'current_level': progress.current_level,
                'is_completed': progress.current_level >= 5,
                'started_at': progress.started_at,
                'unlocked_arcs': progress.unlocked_arcs,
            })
        except UserHuntProgress.DoesNotExist:
            return Response({
                'current_level': 0,
                'is_completed': False,
                'started_at': None,
                'unlocked_arcs': [],
            })


class LeaderboardView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        top = request.query_params.get('top', 50)
        try:
            top = int(top)
        except ValueError:
            top = 50

        leaders = HuntLeaderboard.objects.filter(rank__gt=0).order_by('rank')[:top]
        data = []
        for l in leaders:
            data.append({
                'rank': l.rank,
                'username': getattr(l.user, 'username', l.user.email),
                'score': l.score,
            })
        return Response(data)




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


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrReadOnly])
def admin_progress_list(request):
    progress = UserHuntProgress.objects.select_related('user', 'tshirt_qr').all()
    data = [{
        'id': str(p.id),
        'username': getattr(p.user, 'username', p.user.email),
        'current_level': p.current_level,
        'started_at': p.started_at,
    } for p in progress]
    return Response({'count': len(data), 'results': data})


class HuntLocationListCreateView(generics.ListCreateAPIView):
    queryset = HuntLocation.objects.all()
    serializer_class = HuntLocationSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]


class HuntLocationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = HuntLocation.objects.all()
    serializer_class = HuntLocationSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrReadOnly])
def generate_qr_batch(request):
    qr_type = request.data.get('type', 'tshirt') # Default aaga tshirt irukattum
    generated = []
    # ----------------------------------------------------
    # 1. T-SHIRT QR GENERATION (Existing Logic)
    # ----------------------------------------------------
    if qr_type == 'tshirt':
        order_ids = request.data.get('order_ids', [])
        if not order_ids:
            return Response({'error': 'No order IDs provided.'}, status=400)
        
        from orders.models import Order
        from .utils import generate_unique_qr_secret
        
        for order_id in order_ids:
            try:
                order = Order.objects.get(id=order_id)
                if hasattr(order, 'tshirt_qr'):
                    generated.append({'order_id': str(order_id), 'status': 'already_exists'})
                    continue
                
                secret = generate_unique_qr_secret()
                qr = TShirtQRCode.objects.create(order=order, secret_hash=secret)
                generated.append({
                    'order_id': str(order_id),
                    'status': 'created',
                    'qr_secret': secret,
                    'qr_url': f"{settings.FRONTEND_URL}/scan?code={secret}"
                })
            except Order.DoesNotExist:
                generated.append({'order_id': str(order_id), 'status': 'order_not_found'})

    # ----------------------------------------------------
    # 2. MYSTERY CARD GENERATION (New Logic: Arc / Coupon)
    # ----------------------------------------------------
    elif qr_type in ['arc', 'coupon']:
        count = int(request.data.get('count', 1))
        
        for _ in range(count):
            if qr_type == 'arc':
                arc_slug = request.data.get('arc_slug')
                if not arc_slug:
                    return Response({'error': 'arc_slug is required for Arc QRs'}, status=400)
                
                qr = MysteryCardQR.objects.create(reward_type='arc', arc_slug=arc_slug)
            
            elif qr_type == 'coupon':
                discount = request.data.get('discount')
                if not discount:
                    return Response({'error': 'discount percentage is required for Coupon QRs'}, status=400)
                
                qr = MysteryCardQR.objects.create(reward_type='coupon', discount_percentage=discount)

            generated.append({
                'status': 'created',
                'qr_secret': qr.code,
                'qr_url': f"{settings.FRONTEND_URL}/scan?code={qr.code}",
                'type': qr_type
            })

    else:
        return Response({'error': 'Invalid QR type requested.'}, status=400)

    return Response({'generated': generated, 'total': len(generated)})
    # order_ids = request.data.get('order_ids', [])
    # if not order_ids:
    #     return Response({'error': 'No order IDs provided.'}, status=400)
    
    # from orders.models import Order
    # generated = []
    # for order_id in order_ids:
    #     try:
    #         order = Order.objects.get(id=order_id)
    #         if hasattr(order, 'tshirt_qr'):
    #             generated.append({
    #                 'order_id': str(order_id),
    #                 'status': 'already_exists',
    #                 'qr_secret': order.tshirt_qr.secret_hash
    #             })
    #             continue
            
    #         from .utils import generate_unique_qr_secret
    #         secret = generate_unique_qr_secret()
    #         qr = TShirtQRCode.objects.create(order=order, secret_hash=secret)
    #         generated.append({
    #             'order_id': str(order_id),
    #             'status': 'created',
    #             'qr_secret': secret,
    #             'qr_url': f"{settings.FRONTEND_URL}/scan?code={secret}"
    #         })
    #     except Order.DoesNotExist:
    #         generated.append({'order_id': str(order_id), 'status': 'order_not_found'})
    #     except Exception as e:
    #         generated.append({'order_id': str(order_id), 'status': 'error', 'message': str(e)})
    
    # return Response({'generated': generated, 'total': len(generated)})


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def check_qr_status(request, secret_hash):
    try:
        qr = TShirtQRCode.objects.get(secret_hash=secret_hash)
        return Response({
            'exists': True,
            'is_activated': qr.is_activated,
            'activated_by': getattr(qr.activated_by, 'username', None),
            'created_at': qr.created_at
        })
    except TShirtQRCode.DoesNotExist:
        return Response({'exists': False}, status=404)
    



from rest_framework.views import APIView
from .models import MysteryCardQR, UserHuntProgress
from apps.coupons.models import Coupon

import secrets
class ClaimMysteryCardView(APIView):
    # Customer login panniruntha thaan intha mystery card claim panna mudiyum
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        code = request.data.get('code')
        if not code:
            return Response({'success': False, 'message': 'Code is missing!'}, status=400)

        # 1. Card irukka nu check pandrom
        try:
            mystery_card = MysteryCardQR.objects.get(code=code)
        except MysteryCardQR.DoesNotExist:
            return Response({'success': False, 'message': 'Invalid Mystery Card!'}, status=404)

        # 2. Already use aayiducha nu check pandrom
        if mystery_card.is_used:
            return Response({'success': False, 'message': 'This card has already been claimed!'}, status=400)

        # 3. Card-a "Used" nu mark pandrom
        mystery_card.is_used = True
        mystery_card.claimed_by = request.user
        mystery_card.claimed_at = timezone.now()
        mystery_card.save()

        # 4. REWARD THAROM - ARC ah iruntha:
        if mystery_card.reward_type == 'arc':
            progress, created = UserHuntProgress.objects.get_or_create(user=request.user,defaults={'current_level': 0, 'unlocked_arcs': []})
            arc_slug = mystery_card.arc_slug
            
            # List-la intha arc illana add pandrom
            if arc_slug not in progress.unlocked_arcs:
                progress.unlocked_arcs.append(arc_slug)
                progress.save()
            
            return Response({
                'success': True,
                'reward_type': 'arc',
                'arc_slug': arc_slug,
                'message': f'🌌 SECRET REVEALED! You unlocked the {arc_slug.capitalize()} Arc!'
            })

        # 5. REWARD THAROM - COUPON ah iruntha:
        elif mystery_card.reward_type == 'coupon':
            # Puthusa oru actual coupon-a database-la create pandrom
            coupon_code = f"MYST{secrets.token_urlsafe(4)[:6].upper()}"
            discount = mystery_card.discount_percentage
            
            Coupon.objects.create(
                code=coupon_code,
                description="Mystery Box Reward",
                discount_type='percent',
                discount_value=discount,
                max_uses=1,
                is_active=True,
                expires_at=timezone.now() + timezone.timedelta(days=7) # 7 days validity
            )
            
            return Response({
                'success': True,
                'reward_type': 'coupon',
                'coupon_code': coupon_code,
                'discount': discount,
                'message': f'🎉 SURPRISE! You won {discount}% OFF! Code: {coupon_code}'
            })