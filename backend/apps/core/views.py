from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from .models import HeroBanner
from .serializers import HeroBannerSerializer
import cloudinary
import cloudinary.uploader
import logging

logger = logging.getLogger(__name__)


class HeroBannerList(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdminUser()]

    def get(self, request):
        banners = HeroBanner.objects.filter(is_active=True).order_by('display_order')
        serializer = HeroBannerSerializer(banners, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        try:
            serializer = HeroBannerSerializer(
                data=request.data,
                context={'request': request}
            )
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"HeroBanner POST error: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class HeroBannerDetail(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdminUser()]

    def get(self, request, pk):
        banner = get_object_or_404(HeroBanner, pk=pk)
        return Response(HeroBannerSerializer(banner, context={'request': request}).data)

    def patch(self, request, pk):
        try:
            banner = get_object_or_404(HeroBanner, pk=pk)
            serializer = HeroBannerSerializer(
                banner, data=request.data,
                partial=True, context={'request': request}
            )
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"HeroBanner PATCH error: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, pk):
        banner = get_object_or_404(HeroBanner, pk=pk)
        banner.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UploadImageView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        logger.info(f"Upload request received. FILES: {request.FILES}")
        file = request.FILES.get('image')
        if not file:
            return Response({'error': 'No image provided.'}, status=400)

        try:
            result = cloudinary.uploader.upload(
                file,
                folder='hero_banners',
                resource_type='image',
            )
            return Response({
                'url': result['secure_url'],
                'public_id': result['public_id'],
            })
        except Exception as e:
            logger.error(f"Cloudinary upload error: {str(e)}")
            return Response({'error': str(e)}, status=500)