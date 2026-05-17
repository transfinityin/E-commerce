# apps/reviews/views.py
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.orders.models import Order
from apps.products.models import Product
from apps.users.permissions import IsAdmin
from apps.reviews.models import Review
from .serializers import ReviewSerializer


class ProductReviewListView(generics.ListAPIView):
    serializer_class   = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        product_id = self.kwargs.get('product_id')
        return Review.objects.filter(product_id=product_id).select_related('user')


class ReviewCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, product_id):
        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=404)

        if Review.objects.filter(user=request.user, product=product).exists():
            return Response({'error': 'You have already reviewed this product.'}, status=400)

        # Check if user purchased this product
        purchased = Order.objects.filter(
            user=request.user,
            items__product=product,
            status='delivered'
        ).exists()

        serializer = ReviewSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            review = serializer.save(
                product=product,
                is_verified=purchased,
            )
            return Response(ReviewSerializer(review, context={'request': request}).data, status=201)
        return Response(serializer.errors, status=400)


class ReviewDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(user=self.request.user)


class AdminReviewListView(generics.ListAPIView):
    serializer_class   = ReviewSerializer
    permission_classes = [IsAdmin]
    queryset           = Review.objects.all().select_related('user', 'product')


# 👇 ADD THIS NEW VIEW — Admin Reply
class AdminReplyView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        try:
            review = Review.objects.get(pk=pk)
        except Review.DoesNotExist:
            return Response({'error': 'Review not found.'}, status=404)

        admin_reply = request.data.get('admin_reply')
        if admin_reply is None:
            return Response({'error': 'admin_reply field required.'}, status=400)

        review.admin_reply = admin_reply
        review.save(update_fields=['admin_reply'])
        return Response(ReviewSerializer(review).data)