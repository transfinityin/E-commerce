from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, generics, status
from django.utils import timezone
from decimal import Decimal
from rest_framework.permissions import IsAuthenticated, AllowAny  # ← ADD THIS
from django.utils import timezone
from django.db import transaction
from datetime import timedelta
import secrets  # If used

from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderCreateSerializer
from apps.cart.models import Cart
from apps.users.models import Address
from apps.coupons.models import Coupon
from apps.payments.models import Payment
from apps.users.permissions import IsAdmin


DELIVERY_FEE = Decimal('49.00')
FREE_DELIVERY_ABOVE = Decimal('999.00')


class OrderCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        data = serializer.validated_data

        # Get cart
        try:
            cart = Cart.objects.get(user=request.user)
            if not cart.items.exists():
                return Response({'error': 'Cart is empty.'}, status=400)
        except Cart.DoesNotExist:
            return Response({'error': 'Cart is empty.'}, status=400)

        # Get address
        try:
            address = Address.objects.get(id=data['address_id'], user=request.user)
        except Address.DoesNotExist:
            return Response({'error': 'Address not found.'}, status=404)

        # Validate stock
        for item in cart.items.all():
            if item.product.stock < item.quantity:
                return Response({
                    'error': f'"{item.product.name}" only {item.product.stock} left in stock.'
                }, status=400)

        # Calculate subtotal
        subtotal = cart.subtotal

        # Apply coupon
        discount = Decimal('0.00')
        coupon   = None
        coupon_code = data.get('coupon_code', '').strip().upper()
        if coupon_code:
            try:
                coupon   = Coupon.objects.get(code=coupon_code, is_active=True)
                discount = coupon.calculate_discount(subtotal)
            except Coupon.DoesNotExist:
                pass

        # Delivery fee
        delivery_fee = Decimal('0.00') if subtotal >= FREE_DELIVERY_ABOVE else DELIVERY_FEE
        total = subtotal - discount + delivery_fee

        # Create order
        order = Order.objects.create(
            user=request.user,
            address=address,
            coupon=coupon,
            subtotal=subtotal,
            discount=discount,
            delivery_fee=delivery_fee,
            total=total,
            notes=data.get('notes', ''),
        )

        # Create order items + reduce stock
        for item in cart.items.select_related('product').all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                product_name=item.product.name,
                quantity=item.quantity,
                unit_price=item.product.effective_price,
            )
            item.product.stock -= item.quantity
            item.product.save(update_fields=['stock'])

        # Update coupon usage
        if coupon:
            coupon.used_count += 1
            coupon.save(update_fields=['used_count'])

        # Clear cart
        cart.items.all().delete()

        return Response({
            'message': 'Order placed successfully!',
            'order': OrderSerializer(order, context={'request': request}).data,
        }, status=201)


class OrderListView(generics.ListAPIView):
    serializer_class   = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(
            user=self.request.user
        ).prefetch_related('items__product', 'items__product__images').select_related('address')


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class   = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class OrderCancelView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            order = Order.objects.get(id=pk, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=404)

        if order.status not in ['pending', 'confirmed']:
            return Response({'error': f'Cannot cancel order in "{order.status}" status.'}, status=400)

        # Restore stock
        for item in order.items.all():
            item.product.stock += item.quantity
            item.product.save(update_fields=['stock'])

        order.status = 'cancelled'
        order.save()
        return Response({'message': 'Order cancelled successfully.'})


# Admin views
class AdminOrderListView(generics.ListAPIView):
    serializer_class   = OrderSerializer
    permission_classes = [IsAdmin]
    queryset           = Order.objects.all().select_related('user', 'address').prefetch_related('items')


class AdminOrderDetailView(generics.RetrieveAPIView):
    serializer_class   = OrderSerializer
    permission_classes = [IsAdmin]
    queryset           = Order.objects.all()


class AdminOrderStatusUpdateView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        try:
            order = Order.objects.get(id=pk)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=404)

        new_status = request.data.get('status')
        valid = [s[0] for s in Order.STATUS_CHOICES]
        if new_status not in valid:
            return Response({'error': f'Invalid status. Choose from: {valid}'}, status=400)

        order.status = new_status
        order.save()
        return Response({
            'message': f'Order status updated to {new_status}.',
            'order': OrderSerializer(order, context={'request': request}).data,
        })
    





# views.py

class AssignMapOnPurchase(APIView):
    """Called after T-shirt order is placed"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        order_id = request.data.get('order_id')
        order = Order.objects.get(id=order_id)
        
        # Check if order has T-shirt
        has_tshirt = order.items.filter(
            product__category__name__iexact='t-shirt'
        ).exists()
        
        if not has_tshirt:
            return Response({'error': 'No T-shirt in order'})
        
        # Get currently released maps
        released_maps = TreasureMap.objects.filter(
            is_released=True,
            valid_until__gt=timezone.now()
        )
        
        if not released_maps.exists():
            return Response({'error': 'No active maps available'})
        
        # Randomly assign one map customer doesn't have
        customer_maps = CustomerMapClaim.objects.filter(
            customer=request.user
        ).values_list('map_id', flat=True)
        
        available_maps = released_maps.exclude(id__in=customer_maps)
        
        if not available_maps.exists():
            return Response({
                'message': 'You have all available maps!',
                'maps': list(customer_maps)
            })
        
        assigned_map = random.choice(list(available_maps))
        
        claim = CustomerMapClaim.objects.create(
            customer=request.user,
            map=assigned_map,
            order=order,
            status='claimed'
        )
        
        # Update progress
        progress, _ = CustomerMapProgress.objects.get_or_create(
            customer=request.user
        )
        progress.total_maps_collected += 1
        progress.unique_maps_collected = CustomerMapClaim.objects.filter(
            customer=request.user
        ).values('map').distinct().count()
        progress.save()
        
        return Response({
            'success': True,
            'map': {
                'id': assigned_map.id,
                'name': assigned_map.name,
                'type': assigned_map.map_type,
                'image': assigned_map.image.url if assigned_map.image else None,
                'valid_from': assigned_map.valid_from,
                'valid_until': assigned_map.valid_until,
            },
            'progress': {
                'collected': progress.unique_maps_collected,
                'total': 12,
                'percentage': (progress.unique_maps_collected / 12) * 100
            }
        })


class ClaimMapReward(APIView):
    """Customer claims their reward"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        map_id = request.data.get('map_id')
        
        try:
            claim = CustomerMapClaim.objects.get(
                customer=request.user,
                map_id=map_id,
                status='claimed'
            )
        except CustomerMapClaim.DoesNotExist:
            return Response({'error': 'Map not found or already claimed'})
        
        now = timezone.now()
        treasure_map = claim.map
        
        # Check date range
        if now < treasure_map.valid_from:
            return Response({
                'error': 'Map not yet valid',
                'valid_from': treasure_map.valid_from
            })
        
        if now > treasure_map.valid_until:
            claim.status = 'expired'
            claim.save()
            return Response({
                'error': 'Map expired',
                'valid_until': treasure_map.valid_until
            })
        
        # Check if customer has minimum maps for partial reward
        progress = CustomerMapProgress.objects.get(customer=request.user)
        
        # Calculate reward
        if progress.unique_maps_collected >= 12:
            reward_amount = treasure_map.full_set_prize
            progress.has_completed_all = True
            progress.final_reward_claimed = True
        elif progress.unique_maps_collected >= treasure_map.partial_prize_min_maps:
            reward_amount = treasure_map.partial_prize_amount
        else:
            return Response({
                'error': f'Collect at least {treasure_map.partial_prize_min_maps} maps to claim reward',
                'current': progress.unique_maps_collected
            })
        
        # Process reward
        claim.status = 'rewarded'
        claim.rewarded_at = now
        claim.reward_amount = reward_amount
        claim.save()
        
        progress.total_rewards_earned += reward_amount
        progress.save()
        
        # Create wallet transaction or coupon
        # ... integration with payments ...
        
        return Response({
            'success': True,
            'reward_amount': reward_amount,
            'total_maps': progress.unique_maps_collected,
            'message': f'Congratulations! You won ₹{reward_amount}'
        })


class GetMyMaps(APIView):
    """Customer views their collected maps"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        claims = CustomerMapClaim.objects.filter(
            customer=request.user
        ).select_related('map').order_by('claimed_at')
        
        progress, _ = CustomerMapProgress.objects.get_or_create(
            customer=request.user
        )
        
        return Response({
            'maps': [{
                'id': c.map.id,
                'name': c.map.name,
                'type': c.map.map_type,
                'image': c.map.image.url if c.map.image else None,
                'status': c.status,
                'valid_from': c.map.valid_from,
                'valid_until': c.map.valid_until,
                'is_valid_now': c.map.valid_from <= timezone.now() <= c.map.valid_until,
                'reward_amount': c.reward_amount,
            } for c in claims],
            'progress': {
                'collected': progress.unique_maps_collected,
                'total': 12,
                'percentage': round((progress.unique_maps_collected / 12) * 100, 1),
                'total_rewards': progress.total_rewards_earned,
                'can_claim_full': progress.unique_maps_collected >= 12,
            }
        })


class GetActiveMaps(APIView):
    """Public - view currently active maps"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        maps = TreasureMap.objects.filter(
            is_released=True
        ).order_by('map_type')
        
        return Response({
            'active_maps': [{
                'id': m.id,
                'name': m.name,
                'type': m.map_type,
                'image': m.image.url if m.image else None,
                'valid_from': m.valid_from,
                'valid_until': m.valid_until,
                'description': m.description,
            } for m in maps],
            'next_release': TreasureMap.objects.filter(
                is_released=False
            ).values_list('map_type', flat=True).first()
        })