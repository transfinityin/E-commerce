# D:\Chan\Transfinity\backend\apps\treasurehunt\signals.py
# DELETE EVERYTHING and paste this:

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.apps import apps


def get_order_model():
    """Lazy import to avoid AppRegistryNotReady"""
    return apps.get_model('orders', 'Order')


def get_tshirt_qr_model():
    return apps.get_model('treasurehunt', 'TShirtQRCode')


@receiver(post_save)
def auto_generate_tshirt_qr(sender, instance, created, **kwargs):
    """
    Auto-generate QR code when order is confirmed/paid and contains T-shirt.
    """
    # Lazy check: is sender Order model?
    try:
        Order = get_order_model()
        if sender != Order:
            return
    except:
        return
    
    # Only trigger when status is confirmed/paid/delivered
    if instance.status not in ['confirmed', 'paid', 'delivered', 'processing']:
        return
    
    # Check if QR already exists
    try:
        TShirtQRCode = get_tshirt_qr_model()
        if TShirtQRCode.objects.filter(order=instance).exists():
            return
    except:
        return
    
    # Check if order has T-shirt product
    has_tshirt = False
    try:
        for item in instance.items.all():
            product = item.product
            product_name = getattr(product, 'name', '').lower()
            category_name = ''
            
            if hasattr(product, 'category') and product.category:
                category_name = getattr(product.category, 'name', '').lower()
            
            if any(keyword in product_name for keyword in ['t-shirt', 'tshirt', 't shirt', 'tee']):
                has_tshirt = True
                break
            if any(keyword in category_name for keyword in ['t-shirt', 'tshirt', 't shirt', 'tee']):
                has_tshirt = True
                break
    except Exception as e:
        print(f"Error checking T-shirt: {e}")
        return
    
    # Generate QR if T-shirt found
    if has_tshirt:
        try:
            from .utils import generate_unique_qr_secret
            secret = generate_unique_qr_secret()
            qr = TShirtQRCode.objects.create(
                order=instance,
                secret_hash=secret
            )
            print(f"✅ QR auto-generated for order {instance.id}: {secret}")
        except Exception as e:
            print(f"❌ QR generation failed: {e}")