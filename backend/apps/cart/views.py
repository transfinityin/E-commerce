from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from apps.cart.models import Cart, CartItem
from apps.products.models import Product
from .serializers import CartSerializer, CartItemSerializer


def get_or_create_cart(user):
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cart = get_or_create_cart(request.user)
        return Response(CartSerializer(cart, context={'request': request}).data)

    def delete(self, request):
        cart = get_or_create_cart(request.user)
        cart.items.all().delete()
        return Response({'message': 'Cart cleared.'})


class CartAddView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        quantity   = int(request.data.get('quantity', 1))

        if not product_id:
            return Response({'error': 'product_id required.'}, status=400)

        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=404)

        if product.stock < quantity:
            return Response({'error': f'Only {product.stock} items in stock.'}, status=400)

        cart = get_or_create_cart(request.user)
        item, created = CartItem.objects.get_or_create(cart=cart, product=product)

        if not created:
            item.quantity += quantity
        else:
            item.quantity = quantity

        if item.quantity > product.stock:
            item.quantity = product.stock

        item.save()
        return Response({
            'message': 'Added to cart.',
            'cart': CartSerializer(cart, context={'request': request}).data,
        }, status=201 if created else 200)


class CartUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, item_id):
        quantity = int(request.data.get('quantity', 1))
        try:
            cart = get_or_create_cart(request.user)
            item = CartItem.objects.get(id=item_id, cart=cart)
        except CartItem.DoesNotExist:
            return Response({'error': 'Cart item not found.'}, status=404)

        if quantity <= 0:
            item.delete()
            return Response({'message': 'Item removed from cart.'})

        if quantity > item.product.stock:
            return Response({'error': f'Only {item.product.stock} items in stock.'}, status=400)

        item.quantity = quantity
        item.save()
        return Response({
            'message': 'Cart updated.',
            'cart': CartSerializer(cart, context={'request': request}).data,
        })

    def delete(self, request, item_id):
        try:
            cart = get_or_create_cart(request.user)
            item = CartItem.objects.get(id=item_id, cart=cart)
            item.delete()
            return Response({'message': 'Item removed.'})
        except CartItem.DoesNotExist:
            return Response({'error': 'Item not found.'}, status=404)