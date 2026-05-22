# from django.shortcuts import get_object_or_404
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
# from rest_framework.parsers import MultiPartParser, FormParser
# from rest_framework import status
# from .models import HeroBanner
# from .serializers import HeroBannerSerializer
# import cloudinary
# import cloudinary.uploader
# import logging

# logger = logging.getLogger(__name__)


# class HeroBannerList(APIView):
#     def get_permissions(self):
#         if self.request.method == 'GET':
#             return [AllowAny()]
#         return [IsAdminUser()]

#     def get(self, request):
#         banners = HeroBanner.objects.filter(is_active=True).order_by('display_order')
#         serializer = HeroBannerSerializer(banners, many=True, context={'request': request})
#         return Response(serializer.data)

#     def post(self, request):
#         try:
#             serializer = HeroBannerSerializer(
#                 data=request.data,
#                 context={'request': request}
#             )
#             if serializer.is_valid():
#                 serializer.save()
#                 return Response(serializer.data, status=status.HTTP_201_CREATED)
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             logger.error(f"HeroBanner POST error: {str(e)}")
#             return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class HeroBannerDetail(APIView):
#     def get_permissions(self):
#         if self.request.method == 'GET':
#             return [AllowAny()]
#         return [IsAdminUser()]

#     def get(self, request, pk):
#         banner = get_object_or_404(HeroBanner, pk=pk)
#         return Response(HeroBannerSerializer(banner, context={'request': request}).data)

#     def patch(self, request, pk):
#         try:
#             banner = get_object_or_404(HeroBanner, pk=pk)
#             serializer = HeroBannerSerializer(
#                 banner, data=request.data,
#                 partial=True, context={'request': request}
#             )
#             if serializer.is_valid():
#                 serializer.save()
#                 return Response(serializer.data)
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             logger.error(f"HeroBanner PATCH error: {str(e)}")
#             return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     def delete(self, request, pk):
#         banner = get_object_or_404(HeroBanner, pk=pk)
#         banner.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)


# class UploadImageView(APIView):
#     permission_classes = [IsAuthenticated]
#     parser_classes = [MultiPartParser, FormParser]

#     def post(self, request):
#         logger.info(f"Upload request received. FILES: {request.FILES}")
#         file = request.FILES.get('image')
#         if not file:
#             return Response({'error': 'No image provided.'}, status=400)

#         try:
#             result = cloudinary.uploader.upload(
#                 file,
#                 folder='hero_banners',
#                 resource_type='image',
#             )
#             return Response({
#                 'url': result['secure_url'],
#                 'public_id': result['public_id'],
#             })
#         except Exception as e:
#             logger.error(f"Cloudinary upload error: {str(e)}")
#             return Response({'error': str(e)}, status=500)





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
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser, BasePermission

logger = logging.getLogger(__name__)

class IsStaffUser(BasePermission):
    """JWT-compatible staff check"""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.is_staff
        )
class HeroBannerList(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsStaffUser()]  # IsAdminUser checks is_staff=True

    def get(self, request):
        # Admin (is_staff) → all banners including inactive; public → active only
        if request.user and request.user.is_authenticated and request.user.is_staff:
            banners = HeroBanner.objects.all().order_by('display_order')
        else:
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
            logger.error(f"HeroBanner POST validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"HeroBanner POST error: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class HeroBannerDetail(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsStaffUser()]

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
    # FIX: IsAdminUser instead of IsAuthenticated — only staff can upload banners
    permission_classes = [IsStaffUser]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        logger.info(f"Upload request received. FILES: {request.FILES}, User: {request.user}")
        file = request.FILES.get('image')
        if not file:
            return Response({'error': 'No image provided.'}, status=400)

        # FIX: validate file type before sending to Cloudinary
        allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif']
        if file.content_type not in allowed_types:
            return Response(
                {'error': f'Invalid file type: {file.content_type}. Use JPG, PNG, or WEBP.'},
                status=400
            )

        # FIX: validate file size (10MB max)
        if file.size > 10 * 1024 * 1024:
            return Response({'error': 'File too large. Max 10MB.'}, status=400)

        try:
            result = cloudinary.uploader.upload(
                file,
                folder='hero_banners',
                resource_type='image',
            )
            logger.info(f"Cloudinary upload success: {result['secure_url']}")
            return Response({
                'url': result['secure_url'],
                'public_id': result['public_id'],
            })
        except Exception as e:
            logger.error(f"Cloudinary upload error: {str(e)}")
            return Response(
                {'error': f'Cloudinary upload failed: {str(e)}'},
                status=500
            )