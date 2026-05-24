import uuid
import qrcode
import math
from io import BytesIO
from django.core.files.base import ContentFile
from django.conf import settings

def generate_unique_qr_secret(prefix="th"):
    """Generate unique secret hash for QR codes"""
    unique_id = uuid.uuid4().hex[:12]
    return f"{prefix}-{unique_id}"

def generate_qr_image(secret_hash, box_size=10, border=4):
    """Generate QR code image from secret hash"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=box_size,
        border=border,
    )
    
    # Full URL embedded in QR
    qr_url = f"{settings.FRONTEND_URL}/hunt/start?code={secret_hash}"
    qr.add_data(qr_url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Save to buffer
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    return ContentFile(buffer.getvalue(), name=f'qr_{secret_hash}.png')

def validate_geofence(user_lat, user_long, target_lat, target_long, radius_meters=100):
    """
    Validate if user is within allowed radius of target location.
    Uses Haversine formula - NO external library needed!
    """
    try:
        # Earth radius in meters
        R = 6371e3
        
        # Convert to radians
        lat1 = math.radians(float(user_lat))
        lon1 = math.radians(float(user_long))
        lat2 = math.radians(float(target_lat))
        lon2 = math.radians(float(target_long))
        
        # Differences
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        # Haversine formula
        a = (math.sin(dlat / 2) ** 2 + 
             math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        distance = R * c
        
        return {
            'is_valid': distance <= radius_meters,
            'distance_meters': round(distance, 1),
            'allowed_radius': radius_meters
        }
    except Exception as e:
        return {
            'is_valid': False,
            'distance_meters': None,
            'allowed_radius': radius_meters,
            'error': str(e)
        }

def calculate_hunt_score(progress):
    """Calculate score based on levels and speed"""
    base_score = progress.current_level * 100
    
    # Speed bonus: higher score for faster completion
    if progress.current_level > 0 and progress.started_at:
        from django.utils import timezone
        elapsed_hours = (timezone.now() - progress.started_at).total_seconds() / 3600
        speed_bonus = max(0, 500 - int(elapsed_hours * 10))
        base_score += speed_bonus
    
    # Completion bonus
    if progress.is_completed:
        base_score += 1000
    
    return base_score