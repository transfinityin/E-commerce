from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import TShirtQRCode, HuntLocation, UserHuntProgress
from .utils import validate_geofence, calculate_hunt_score

User = get_user_model()

class TreasureHuntTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            name='Test User'
        )

        self.location = HuntLocation.objects.create(
            level=1,
            name='Test Location',
            clue_text_tamil='Test clue Tamil',
            clue_text_english='Test clue English',
            geo_lat=13.0827,
            geo_long=80.2707,
            location_qr_secret='loc-test123'
        )

    def test_geofence_validation(self):
        # Test within 100m
        result = validate_geofence(13.0827, 80.2707, 13.0827, 80.2707, 100)
        self.assertTrue(result['is_valid'])

        # Test far away
        result = validate_geofence(13.0000, 80.0000, 13.0827, 80.2707, 100)
        self.assertFalse(result['is_valid'])

    def test_progress_creation(self):
        # Mock QR code
        from orders.models import Order  # Adjust import
        # Create test order and QR, then test activation flow
        pass