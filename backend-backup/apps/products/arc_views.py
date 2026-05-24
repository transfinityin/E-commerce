# arc_lore — FIX: .values('images') removed — images is a related manager, not a field
# Use ProductListSerializer instead to serialize properly

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from .models import Product

ARC_DATA = {
    'wanderer': {
        'name': 'Wanderer Edition',
        'rank': 'Wanderer',
        'theme': 'The Frame',
        'tagline': 'Escape The Frame',
        'color': '#555555',
        'story': 'You are trapped in The Frame — a system that suppresses ambition, creativity, and individuality. Everyone around you accepts average lives. But you feel different. You sense there is more beyond the walls. The journey begins when you refuse to accept the limits placed upon you. Take the first step. Break free.',
        'video_url': '/media/lore/wanderer.mp4',
    },
    'founder': {
        'name': 'Founder Edition',
        'rank': 'Rank I',
        'theme': 'Awakening',
        'tagline': 'The Beginning Begins',
        'color': '#FFD700',
        'story': 'The protagonist discovers that the world is fake — controlled by invisible limits. Everyone around him accepts average lives. But he refuses. He creates the symbol of infinity and begins building TRANSFINITY in secret. Only a few people believe in the vision. These people become: "The Founders"',
        'video_url': '/media/lore/founder.mp4',
    },
    'ascendant': {
        'name': 'Ascension Edition',
        'rank': 'Rank II',
        'theme': 'Evolution',
        'tagline': 'Rise Beyond Limits',
        'color': '#9D4EDD',
        'story': 'The protagonist trains mentally and physically. Failures become fuel. Pain becomes power. The TRANSFINITY symbol begins spreading across cities. People start realizing: "This is not a clothing brand. This is a movement."',
        'video_url': '/media/lore/ascendant.mp4',
    },
    'phantom': {
        'name': 'Phantom Arc',
        'rank': 'Phantom',
        'theme': 'Mystery',
        'tagline': 'The Disappearance',
        'color': '#808080',
        'story': 'The protagonist disappears from society to rebuild himself mentally. Nobody knows where he went. But whispers of the infinity symbol begin appearing everywhere. Theme: Mystery, Isolation, Silent growth.',
        'video_url': '/media/lore/phantom.mp4',
    },
    'eclipse': {
        'name': 'Eclipse Edition',
        'rank': 'Rank III',
        'theme': 'Darkness',
        'tagline': 'Power Born In Darkness',
        'color': '#FF0040',
        'story': 'Enemies appear. Fake people. Betrayal. Pressure. Isolation. The protagonist disappears from the public eye. Rumors spread: "TRANSFINITY is dead." But in darkness, the strongest version of him is being created. Then one night: The Eclipse Begins.',
        'video_url': '/media/lore/eclipse.mp4',
    },
    'eternal': {
        'name': 'Eternal Edition',
        'rank': 'Rank IV',
        'theme': 'Legacy',
        'tagline': 'Legacy Never Dies',
        'color': '#FFD700',
        'story': 'Years later… TRANSFINITY becomes legendary. The Founder is no longer just a person. He becomes a symbol. People wear the editions like ranks of evolution. The final truth is revealed: TRANSFINITY was never about fashion. It was about becoming limitless.',
        'video_url': '/media/lore/eternal.mp4',
    },
}


@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def arc_list(request):
    """GET /api/products/arcs/"""
    user = request.user if request.user.is_authenticated else None
    arcs = []

    for key, data in ARC_DATA.items():
        arc_info = {
            'id': key,
            'name': data['name'],
            'rank': data['rank'],
            'theme': data['theme'],
            'color': data['color'],
            'is_unlocked': user.is_arc_unlocked(key) if user else False,
            'can_preview': user.can_access_arc(key) if user else key == 'founder',
            'product_count': Product.objects.filter(arc_type=key, is_active=True).count(),
        }
        arcs.append(arc_info)

    return Response(arcs)


@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def arc_lore(request, arc_name):
    """GET /api/products/arcs/founder/lore/"""
    if arc_name not in ARC_DATA:
        return Response({'error': 'Arc not found'}, status=404)

    user = request.user if request.user.is_authenticated else None

    if user and not user.can_access_arc(arc_name):
        return Response({'error': 'Complete previous Arc to unlock'}, status=403)

    data = ARC_DATA[arc_name]

    # FIX: .values('images') was wrong — images is a reverse FK, not a field
    # Use proper serialization with primary image only
    products_qs = Product.objects.filter(
        arc_type=arc_name,
        is_active=True
    ).prefetch_related('images').values('id', 'name', 'slug', 'price')

    # Build product list with primary image URL
    products_list = []
    for p in Product.objects.filter(arc_type=arc_name, is_active=True).prefetch_related('images'):
        primary = p.images.filter(is_primary=True).first() or p.images.first()
        primary_url = None
        if primary:
            if hasattr(primary.image, 'url'):
                try:
                    primary_url = request.build_absolute_uri(primary.image.url)
                except Exception:
                    primary_url = str(primary.image)
            else:
                primary_url = str(primary.image)

        products_list.append({
            'id': str(p.id),
            'name': p.name,
            'slug': p.slug,
            'price': str(p.price),
            'primary_image': primary_url,
        })

    return Response({
        'id': arc_name,
        **data,
        'products': products_list,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def arc_products(request, arc_name):
    """GET /api/products/arcs/founder/products/"""
    products = Product.objects.filter(
        arc_type=arc_name,
        is_active=True
    ).select_related('category').prefetch_related('images')

    if request.user.is_authenticated:
        rank_order = ['wanderer', 'founder', 'ascendant', 'phantom', 'eclipse', 'eternal']
        try:
            user_idx = rank_order.index(request.user.rank)
            allowed_ranks = rank_order[:user_idx + 1]
            products = products.filter(required_rank__in=allowed_ranks)
        except (ValueError, AttributeError):
            pass  # If rank not found, show all

    from .serializers import ProductListSerializer
    serializer = ProductListSerializer(products, many=True, context={'request': request})
    return Response(serializer.data)