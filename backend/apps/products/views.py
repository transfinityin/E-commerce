from rest_framework import generics, status, permissions, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
import re
from django.db.models.functions import Greatest
from django.db.models import Q, Value, FloatField

from .models import Category, Product, ProductImage
from .serializers import (
    CategorySerializer, ProductListSerializer,
    ProductDetailSerializer, ProductWriteSerializer,
    ProductImageSerializer,
)
from apps.users.permissions import IsAdmin
import re
from django.db.models import Q, Value, FloatField, Case, When, IntegerField
from django.contrib.postgres.search import (
    SearchQuery, SearchRank, SearchVector, TrigramSimilarity, TrigramWordSimilarity
)
from rest_framework import generics, permissions
from .models import Product
from .serializers import ProductListSerializer

class CategoryListView(generics.ListAPIView):
    serializer_class   = CategorySerializer
    permission_classes = [permissions.AllowAny]
    def get_queryset(self):
        return Category.objects.filter(parent=None, is_active=True)


class CategoryDetailView(generics.RetrieveAPIView):
    serializer_class   = CategorySerializer
    permission_classes = [permissions.AllowAny]
    queryset           = Category.objects.filter(is_active=True)
    lookup_field       = 'slug'


class AdminCategoryListCreateView(generics.ListCreateAPIView):
    serializer_class   = CategorySerializer
    permission_classes = [IsAdmin]
    queryset           = Category.objects.all()


class AdminCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = CategorySerializer
    permission_classes = [IsAdmin]
    queryset           = Category.objects.all()


# class ProductListView(generics.ListAPIView):
#     serializer_class   = ProductListSerializer
#     permission_classes = [permissions.AllowAny]
#     filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
#     filterset_fields   = ['category', 'is_featured']
#     search_fields      = ['name', 'description', 'sku']
#     ordering_fields    = ['price', 'rating_avg', 'created_at', 'name']
#     ordering           = ['-created_at']

#     def get_queryset(self):
#         qs = Product.objects.filter(is_active=True).select_related('category').prefetch_related('images')
#         min_price     = self.request.query_params.get('min_price')
#         max_price     = self.request.query_params.get('max_price')
#         in_stock      = self.request.query_params.get('in_stock')
#         category_slug = self.request.query_params.get('category_slug')
#         if min_price:
#             qs = qs.filter(price__gte=min_price)
#         if max_price:
#             qs = qs.filter(price__lte=max_price)
#         if in_stock == 'true':
#             qs = qs.filter(stock__gt=0)
#         if category_slug:
#             qs = qs.filter(
#                 Q(category__slug=category_slug) |
#                 Q(category__parent__slug=category_slug)
#             )
#         return qs

class ProductListView(generics.ListAPIView):
    serializer_class   = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['category', 'is_featured']
    search_fields      = [
        'name',
        'description', 
        'category__name',
        'sku',
    ]
    ordering_fields    = ['price', 'rating_avg', 'created_at', 'name']
    ordering           = ['-created_at']
    
    def get_queryset(self):
        qs = Product.objects.filter(is_active=True).select_related('category').prefetch_related('images')
        
        min_price     = self.request.query_params.get('min_price')
        max_price     = self.request.query_params.get('max_price')
        in_stock      = self.request.query_params.get('in_stock')
        category_slug = self.request.query_params.get('category_slug')
        
        if min_price: qs = qs.filter(price__gte=min_price)
        if max_price: qs = qs.filter(price__lte=max_price)
        if in_stock == 'true': qs = qs.filter(stock__gt=0)
        if category_slug:
            qs = qs.filter(
                Q(category__slug=category_slug) |
                Q(category__parent__slug=category_slug)
            )
        return qs
    
class ProductDetailView(generics.RetrieveAPIView):
    serializer_class   = ProductDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field       = 'slug'
    def get_queryset(self):
        return Product.objects.filter(is_active=True).select_related('category').prefetch_related('images','reviews')


class RelatedProductsView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request, slug):
        try:
            product = Product.objects.get(slug=slug, is_active=True)
            related = Product.objects.filter(
                category=product.category, is_active=True
            ).exclude(id=product.id).prefetch_related('images')[:8]
            return Response(ProductListSerializer(related, many=True, context={'request': request}).data)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=404)


class FeaturedProductsView(generics.ListAPIView):
    serializer_class   = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    def get_queryset(self):
        return Product.objects.filter(is_active=True, is_featured=True).prefetch_related('images')[:12]


class NewArrivalsView(generics.ListAPIView):
    serializer_class   = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    def get_queryset(self):
        return Product.objects.filter(is_active=True).order_by('-created_at').prefetch_related('images')[:12]


# class SearchView(generics.ListAPIView):
#     serializer_class   = ProductListSerializer
#     permission_classes = [permissions.AllowAny]
#     def get_queryset(self):
#         q = self.request.query_params.get('q', '')
#         if not q:
#             return Product.objects.none()
#         return Product.objects.filter(
#             Q(name__icontains=q) |
#             Q(description__icontains=q) |
#             Q(category__name__icontains=q),
#             is_active=True
#         ).prefetch_related('images')[:20]


class SearchView(generics.ListAPIView):
    serializer_class   = ProductListSerializer
    permission_classes = [permissions.AllowAny]

    # Synonym dictionary — Amazon style
    SYNONYMS = {
        'tshirt':     ['t-shirt', 't shirt', 'shirt', 'tee'],
        'tshirts':    ['t-shirts', 't shirts', 'shirts', 'tees'],
        'trouser':    ['trouser', 'trousers', 'pant', 'pants'],
        'trackpant':  ['track pant', 'track pants', 'jogger', 'joggers'],
        'trackpants': ['track pants', 'jogger', 'joggers', 'sweatpants'],
        'halfpant':   ['half pant', 'shorts', 'bermuda'],
        'fullpant':   ['full pant', 'trouser', 'pant'],
        'sweatshirt': ['sweat shirt', 'sweater', 'pullover'],
        'hoodie':     ['hoodie', 'hoody', 'sweatshirt', 'hood'],
        'jeans':      ['jeans', 'denim', 'denims'],
        'kurta':      ['kurta', 'kurti', 'ethnic wear'],
        'shirt':      ['shirt', 'formal shirt', 'casual shirt', 'top'],
        'jacket':     ['jacket', 'blazer', 'coat', 'windbreaker'],
        'dress':      ['dress', 'frock', 'gown', 'maxi'],
        'saree':      ['saree', 'sari', 'silk saree'],
        'legging':    ['legging', 'leggings', 'tights', 'jegging'],
        'sandal':     ['sandal', 'sandals', 'slipper', 'chappal'],
        'sneaker':    ['sneaker', 'sneakers', 'shoes', 'sports shoes'],
        'watch':      ['watch', 'wristwatch', 'timepiece'],
        'bag':        ['bag', 'handbag', 'backpack', 'purse', 'tote'],
    }

    def normalize_query(self, q):
        """Normalize: lowercase, remove extra spaces, handle hyphens."""
        q = q.lower().strip()
        q = re.sub(r'\s+', ' ', q)
        return q

    def get_all_terms(self, q):
        """Generate all search term variations like Amazon."""
        terms = set()
        q_norm = self.normalize_query(q)

        terms.add(q_norm)
        terms.add(q_norm.replace('-', ' '))   # t-shirt → t shirt
        terms.add(q_norm.replace('-', ''))    # t-shirt → tshirt
        terms.add(q_norm.replace(' ', '-'))   # t shirt → t-shirt
        terms.add(q_norm.replace(' ', ''))    # t shirt → tshirt

        # Insert hyphen/space after 1st char for compound words
        if len(q_norm) > 3 and '-' not in q_norm and ' ' not in q_norm:
            terms.add(q_norm[0] + '-' + q_norm[1:])   # tshirt → t-shirt
            terms.add(q_norm[0] + ' ' + q_norm[1:])   # tshirt → t shirt

        # Synonyms
        if q_norm in self.SYNONYMS:
            terms.update(self.SYNONYMS[q_norm])

        # Also check without spaces
        q_nospace = q_norm.replace(' ', '').replace('-', '')
        if q_nospace in self.SYNONYMS:
            terms.update(self.SYNONYMS[q_nospace])

        return terms

    def get_queryset(self):
        q = self.request.query_params.get('q', '').strip()
        if not q:
            return Product.objects.none()

        all_terms = self.get_all_terms(q)

        # ── Method 1: PostgreSQL Full-Text Search (fast + ranked) ──
        try:
            # Build search query with all terms
            search_queries = []
            for term in all_terms:
                search_queries.append(SearchQuery(term, config='english', search_type='plain'))

            # Combine with OR
            combined_search = search_queries[0]
            for sq in search_queries[1:]:
                combined_search = combined_search | sq

            fts_results = Product.objects.filter(
                search_vector=combined_search,
                is_active=True
            ).annotate(
                rank=SearchRank('search_vector', combined_search)
            ).order_by('-rank').prefetch_related('images').select_related('category')[:30]

            if fts_results.exists():
                return fts_results

        except Exception:
            pass

        # ── Method 2: Trigram similarity (fuzzy — handles typos) ──
        try:
            # "tshirt" → 0.6 similarity to "T-Shirt"
            trgm_results = Product.objects.filter(
                is_active=True
            ).annotate(
                sim=TrigramWordSimilarity(q, 'name')
            ).filter(
                sim__gt=0.2
            ).order_by('-sim').prefetch_related('images').select_related('category')[:30]

            if trgm_results.exists():
                return trgm_results

        except Exception:
            pass

        # ── Method 3: icontains fallback (always works) ──
        combined_q = Q()
        for term in all_terms:
            combined_q |= Q(name__icontains=term)
            combined_q |= Q(tags__icontains=term)
            combined_q |= Q(category__name__icontains=term)
            # Word-by-word
            for word in term.split():
                if len(word) >= 2:
                    combined_q |= Q(name__icontains=word)
                    combined_q |= Q(tags__icontains=word)

        return Product.objects.filter(
            combined_q,
            is_active=True
        ).select_related('category').prefetch_related('images').distinct()[:40]

    # def get_queryset(self):
    #     q = self.request.query_params.get('q', '').strip()
    #     if not q:
    #         return Product.objects.none()

    #     # Remove spaces + hyphens for flexible matching
    #     # "tshirt" → matches "T-Shirt", "T Shirt", "Tshirt"
    #     q_clean = q.replace('-', ' ').replace('_', ' ')

    #     # Split into words for multi-word search
    #     words = q_clean.split()

    #     from functools import reduce
    #     import operator

    #     # Each word must appear somewhere in name or description
    #     query = Q()
    #     for word in words:
    #         word_q = (
    #             Q(name__icontains=word) |
    #             Q(description__icontains=word) |
    #             Q(category__name__icontains=word) |
    #             Q(sku__icontains=word)
    #         )
    #         query &= word_q

    #     # Also try full original query
    #     full_q = (
    #         Q(name__icontains=q) |
    #         Q(description__icontains=q) |
    #         Q(category__name__icontains=q)
    #     )

    #     return Product.objects.filter(
    #         full_q | query,
    #         is_active=True
    #     ).prefetch_related('images').distinct()[:30]

class AdminProductListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdmin]
    filter_backends    = [filters.SearchFilter, filters.OrderingFilter]
    search_fields      = ['name', 'sku']
    ordering_fields    = ['created_at', 'price', 'stock']
    def get_serializer_class(self):
        return ProductWriteSerializer if self.request.method == 'POST' else ProductListSerializer
    def get_queryset(self):
        return Product.objects.all().select_related('category').prefetch_related('images')


class AdminProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdmin]
    queryset           = Product.objects.all()
    def get_serializer_class(self):
        return ProductWriteSerializer if self.request.method in ['PUT','PATCH'] else ProductDetailSerializer


class ProductImageUploadView(APIView):
    permission_classes = [IsAdmin]
    parser_classes     = [MultiPartParser, FormParser]

    def post(self, request, product_id):
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=404)
        images = request.FILES.getlist('images')
        if not images:
            return Response({'error': 'No images provided.'}, status=400)
        created = []
        for i, image in enumerate(images):
            is_primary = (i == 0 and not product.images.exists())
            img = ProductImage.objects.create(
                product=product, image=image,
                is_primary=is_primary,
                sort_order=product.images.count() + i,
            )
            created.append(ProductImageSerializer(img, context={'request': request}).data)
        return Response({'message': f'{len(created)} image(s) uploaded.', 'images': created}, status=201)

    def delete(self, request, product_id):
        image_id = request.data.get('image_id')
        try:
            img = ProductImage.objects.get(id=image_id, product_id=product_id)
            img.delete()
            return Response({'message': 'Image deleted.'})
        except ProductImage.DoesNotExist:
            return Response({'error': 'Image not found.'}, status=404)


class SetPrimaryImageView(APIView):
    permission_classes = [IsAdmin]
    def post(self, request, product_id, image_id):
        try:
            img = ProductImage.objects.get(id=image_id, product_id=product_id)
            ProductImage.objects.filter(product_id=product_id).update(is_primary=False)
            img.is_primary = True
            img.save()
            return Response({'message': 'Primary image updated.'})
        except ProductImage.DoesNotExist:
            return Response({'error': 'Image not found.'}, status=404)