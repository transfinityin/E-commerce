import razorpay
import hmac
import hashlib
from django.conf import settings
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from apps.orders.models import Order
from .models import Payment

client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


class CreateRazorpayOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('order_id')
        try:
            order = Order.objects.get(id=order_id, user=request.user, status='pending')
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, status=404)

        # Amount in paise
        amount_paise = int(order.total * 100)

        razorpay_order = client.order.create({
            'amount':   amount_paise,
            'currency': 'INR',
            'receipt':  str(order.id)[:40],
        })

        # Fix: create with all required fields
        try:
            payment = Payment.objects.get(order=order)
            payment.razorpay_order_id = razorpay_order['id']
            payment.amount = order.total
            payment.status = 'pending'
            payment.save()
        except Payment.DoesNotExist:
            payment = Payment.objects.create(
                order=order,
                razorpay_order_id=razorpay_order['id'],
                amount=order.total,
                status='pending',
            )

        return Response({
            'razorpay_order_id': razorpay_order['id'],
            'amount':            amount_paise,
            'currency':          'INR',
            'key':               settings.RAZORPAY_KEY_ID,
            'order_id':          str(order.id),
            'name':              'ShopEase',
            'description':       f'Order #{str(order.id)[:8]}',
        })


class VerifyPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        razorpay_order_id   = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature  = request.data.get('razorpay_signature')

        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
            return Response({'error': 'Missing payment details.'}, status=400)

        # Verify signature
        body    = f'{razorpay_order_id}|{razorpay_payment_id}'
        expected = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            body.encode(),
            hashlib.sha256
        ).hexdigest()

        try:
            payment = Payment.objects.get(razorpay_order_id=razorpay_order_id)
        except Payment.DoesNotExist:
            return Response({'error': 'Payment not found.'}, status=404)

        if expected == razorpay_signature:
            payment.razorpay_payment_id = razorpay_payment_id
            payment.razorpay_signature  = razorpay_signature
            payment.status  = 'success'
            payment.paid_at = timezone.now()
            payment.save()

            order = payment.order
            order.status = 'confirmed'
            order.save()

            return Response({
                'message':  'Payment successful!',
                'order_id': str(order.id),
                'status':   'confirmed',
            })
        else:
            payment.status = 'failed'
            payment.save()
            return Response({'error': 'Payment verification failed.'}, status=400)