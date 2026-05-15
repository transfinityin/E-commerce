from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework import status
from .models import HeroBanner
from .serializers import HeroBannerSerializer


class HeroBannerList(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        banners = HeroBanner.objects.filter(is_active=True).order_by('display_order')
        serializer = HeroBannerSerializer(banners, many=True, context={'request': request})
        return Response(serializer.data)
    
    def post(self, request):
        # Admin only - change permission as needed
        serializer = HeroBannerSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class HeroBannerDetail(APIView):
    permission_classes = [AllowAny]  # Admin ku matum IsAdminUser venum na maathi vekkanum
    
    def get(self, request, pk):
        banner = get_object_or_404(HeroBanner, pk=pk)
        serializer = HeroBannerSerializer(banner, context={'request': request})
        return Response(serializer.data)
    
    def patch(self, request, pk):
        banner = get_object_or_404(HeroBanner, pk=pk)
        serializer = HeroBannerSerializer(banner, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        banner = get_object_or_404(HeroBanner, pk=pk)
        banner.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)