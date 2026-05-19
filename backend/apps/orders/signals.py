# D:\Chan\Transfinity\backend\apps\orders\signals.py

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.apps import apps


def get_tshirt_qr_model():
    return apps.get_model('treasurehunt', 'TShirtQRCode')


@receiver(post_save)
def auto_generate_tshirt_qr_on_order_create(sender, instance, created, **kwargs):
    """
    Auto-generate QR code when ANY order with T-shirt is created.
    Works for: Online Payment, COD, Wallet, any payment method!
    """
    # Lazy check: is sender Order model?
    try:
        Order = apps.get_model('orders', 'Order')
        if sender != Order:
            return
    except:
        return
    
    # ✅ IMPORTANT: Only run when order is FIRST CREATED (not on updates)
    # This ensures QR is generated once, immediately after order placement
    if not created:
        return
    
    # Check if QR already exists (safety check)
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
            
            if any(keyword in product_name for keyword in ['t-shirt', 'tshirt', 't shirt', 'tee', 'shirt']):
                has_tshirt = True
                break
            if any(keyword in category_name for keyword in ['t-shirt', 'tshirt', 't shirt', 'tee', 'shirt']):
                has_tshirt = True
                break
    except Exception as e:
        print(f"Error checking T-shirt: {e}")
        return
    
    # Generate QR if T-shirt found
    if has_tshirt:
        try:
            from apps.treasurehunt.utils import generate_unique_qr_secret
            secret = generate_unique_qr_secret()
            qr = TShirtQRCode.objects.create(
                order=instance,
                secret_hash=secret
            )
            print(f"✅ QR auto-generated for NEW order {instance.id}: {secret}")
            
            
            # This happens regardless of payment method!
            # send_qr_email(instance.user.email, secret)
            
        except Exception as e:
            print(f"❌ QR generation failed: {e}")