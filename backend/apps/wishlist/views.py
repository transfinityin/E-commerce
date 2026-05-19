from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, generics
from apps.products.models import Product
from apps.wishlist.models import Wishlist
from .serializers import WishlistSerializer


class WishlistView(generics.ListAPIView):
    serializer_class   = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
        
         Wishlist.objects
            .filter(user=self.request.user)
            .select_related('product')
            .order_by('-created_at')   # or 'id', 'product__name', etc.)
        )

class WishlistToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({'error': 'product_id required.'}, status=400)

        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=404)

        wishlist_item, created = Wishlist.objects.get_or_create(
            user=request.user, product=product
        )

        if not created:
            wishlist_item.delete()
            return Response({'message': 'Removed from wishlist.', 'wishlisted': False})

        return Response({
            'message': 'Added to wishlist.',
            'wishlisted': True,
            'item': WishlistSerializer(wishlist_item, context={'request': request}).data,
        }, status=201)


class WishlistRemoveView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        try:
            item = Wishlist.objects.get(id=pk, user=request.user)
            item.delete()
            return Response({'message': 'Removed from wishlist.'})
        except Wishlist.DoesNotExist:
            return Response({'error': 'Item not found.'}, status=404)