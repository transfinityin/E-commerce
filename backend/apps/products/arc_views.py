from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from .models import Product

ARC_DATA = {
    'founder': {
        'name': 'Founder Edition',
        'rank': 'Rank I',
        'theme': 'Awakening',
        'tagline': 'The Beginning Begins',
        'color': '#FFD700',
        'story': 'The protagonist discovers the world is fake...',
        'video_url': '/media/lore/founder.mp4',
    },
    'ascendant': {
        'name': 'Ascension Edition',
        'rank': 'Rank II',
        'theme': 'Evolution',
        'tagline': 'Rise Beyond Limits',
        'color': '#9D4EDD',
        'story': 'The protagonist trains mentally and physically...',
        'video_url': '/media/lore/ascendant.mp4',
    },
    'phantom': {
        'name': 'Phantom Arc',
        'rank': 'Phantom',
        'theme': 'Mystery',
        'tagline': 'The Disappearance',
        'color': '#808080',
        'story': 'The protagonist disappears from society...',
        'video_url': '/media/lore/phantom.mp4',
    },
    'eclipse': {
        'name': 'Eclipse Edition',
        'rank': 'Rank III',
        'theme': 'Darkness',
        'tagline': 'Power Born In Darkness',
        'color': '#FF0040',
        'story': 'Enemies appear. Betrayal. Isolation...',
        'video_url': '/media/lore/eclipse.mp4',
    },
    'eternal': {
        'name': 'Eternal Edition',
        'rank': 'Rank IV',
        'theme': 'Legacy',
        'tagline': 'Legacy Never Dies',
        'color': '#FFD700',
        'story': 'Years later... TRANSFINITY becomes legendary...',
        'video_url': '/media/lore/eternal.mp4',
    },
}

@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def arc_list(request):
    """GET /api/arcs/"""
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
            'product_count': Product.objects.filter(arc_type=key).count(),
        }
        arcs.append(arc_info)
    
    return Response(arcs)

@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def arc_lore(request, arc_name):
    """GET /api/arcs/founder/lore/"""
    if arc_name not in ARC_DATA:
        return Response({'error': 'Arc not found'}, status=404)
    
    user = request.user if request.user.is_authenticated else None
    data = ARC_DATA[arc_name]
    
    # Check access
    if user and not user.can_access_arc(arc_name):
        return Response({'error': 'Complete previous Arc to unlock'}, status=403)
    
    return Response({
        'id': arc_name,
        **data,
        'products': Product.objects.filter(arc_type=arc_name).values('id', 'name', 'slug', 'price', 'images'),
    })

@api_view(['GET'])
def arc_products(request, arc_name):
    """GET /api/arcs/founder/products/"""
    products = Product.objects.filter(arc_type=arc_name, is_active=True)
    # Serialize and return...
    from .serializers import ProductSerializer
    serializer = ProductSerializer(products, many=True, context={'request': request})
    return Response(serializer.data)