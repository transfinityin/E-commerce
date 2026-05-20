from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from .models import HeroBanner
from .serializers import HeroBannerSerializer
import cloudinary
import cloudinary.uploader


class HeroBannerList(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        banners = HeroBanner.objects.filter(is_active=True).order_by('display_order')
        serializer = HeroBannerSerializer(banners, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        serializer = HeroBannerSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class HeroBannerDetail(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        banner = get_object_or_404(HeroBanner, pk=pk)
        return Response(HeroBannerSerializer(banner, context={'request': request}).data)

    def patch(self, request, pk):
        banner = get_object_or_404(HeroBanner, pk=pk)
        serializer = HeroBannerSerializer(
            banner, data=request.data,
            partial=True, context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        banner = get_object_or_404(HeroBanner, pk=pk)
        banner.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── Image Upload — Cloudinary ─────────────────────────────────
class UploadImageView(APIView):
    permission_classes = [AllowAny]
    parser_classes     = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get('image')
        if not file:
            return Response({'error': 'No image provided.'}, status=400)

        try:
            # Upload to Cloudinary
            result = cloudinary.uploader.upload(
                file,
                folder='hero_banners',
                resource_type='image',
            )
            return Response({
                'url':       result['secure_url'],
                'public_id': result['public_id'],
            })
        except Exception as e:
            return Response({'error': str(e)}, status=500)