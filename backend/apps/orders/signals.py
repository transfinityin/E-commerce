

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.apps import apps
from apps.notifications.utils import send_notification_email
try:
    from apps.utils.google_sheets import log_to_sheet
except ImportError:
    def log_to_sheet(*args, **kwargs):
        pass

        
@receiver(post_save, sender='orders.Order')
def order_status_notification(sender, instance, created, **kwargs):
    Notification = apps.get_model('notifications', 'Notification')
    
    try:
        items = instance.items.all()
        product_names = ", ".join([item.product.name for item in items]) if items else "N/A"
    except Exception:
        product_names = "N/A"
    
    total = (
        getattr(instance, 'total_amount', None) 
        or getattr(instance, 'total', None) 
        or getattr(instance, 'total_price', None) 
        or getattr(instance, 'grand_total', None) 
        or getattr(instance, 'amount', None) 
        or '0'
    )
    total_str = str(total)
    status = getattr(instance, 'status', 'placed')

    if created:
        notif = Notification.objects.create(
            user=instance.user,
            type='order',
            title=f"✅ Order #{instance.id} Placed",
            message=f"Your order for {product_names} worth ₹{total_str} has been confirmed!",
            link=f"/orders/{instance.id}"
        )
        # 🔥 FIX: Wrap email in try-except so order doesn't crash
        try:
            send_notification_email(instance.user, notif.title, notif.message)
        except Exception as e:
            print(f"⚠️ Email failed (non-critical): {e}")
        try:

            log_to_sheet("Orders", [
                str(instance.created_at),
                instance.user.email,
                instance.user.name,
                str(instance.id),
                product_names,
                total_str,
                status,
                "Order Placed"
            ])
        except Exception as e:
            print(f"⚠️ Sheets log failed (non-critical): {e}")
        
        return
    
    
    if status == 'shipped':
        notif = Notification.objects.create(
            user=instance.user,
            type='order',
            title=f"🚚 Order #{instance.id} Shipped",
            message=f"Your order ({product_names}) is on the way!",
            link=f"/orders/{instance.id}"
        )
        send_notification_email(instance.user, notif.title, notif.message)
        log_to_sheet("Orders", [
            str(getattr(instance, 'updated_at', instance.created_at)),
            instance.user.email,
            instance.user.name,
            str(instance.id),
            product_names,
            total_str,
            status,
            "Shipped"
        ])
    
    elif status == 'cancelled':
        notif = Notification.objects.create(
            user=instance.user,
            type='system',
            title=f"❌ Order #{instance.id} Cancelled",
            message=f"Your order for {product_names} has been cancelled.",
            link=f"/orders/{instance.id}"
        )
        send_notification_email(instance.user, notif.title, notif.message)
        log_to_sheet("Orders", [
            str(getattr(instance, 'updated_at', instance.created_at)),
            instance.user.email,
            instance.user.name,
            str(instance.id),
            product_names,
            total_str,
            status,
            "Cancelled"
        ])


@receiver(post_save)
def check_rank_upgrade(sender, instance, created, **kwargs):
    """
    When order is delivered, check if user bought their CURRENT rank's products.
    If yes, unlock NEXT rank.
    """
    try:
        Order = apps.get_model('orders', 'Order')
        if sender != Order:
            return
    except:
        return
    
    # Only run on status update to 'delivered'
    if created:
        return
    
    if instance.status != 'delivered':
        return
    
    # Check if already processed
    if getattr(instance, 'arc_unlock_processed', False):
        return
    
    user = instance.user
    products = instance.items.all().values_list('product__arc_type', flat=True)
    
    # ✅ CORRECT: Buy CURRENT rank → unlock NEXT rank
    rank_requirements = {
        'wanderer': 'wanderer',    # Buy Wanderer → unlock Founder
        'founder': 'founder',       # Buy Founder → unlock Ascendant
        'ascendant': 'ascendant',   # Buy Ascendant → unlock Phantom
        'phantom': 'phantom',       # Buy Phantom → unlock Eclipse
        'eclipse': 'eclipse',       # Buy Eclipse → unlock Eternal
    }
    
    required_arc = rank_requirements.get(user.rank)
    
    # Check if user bought required arc products
    if required_arc and required_arc in products:
        new_rank = user.unlock_next_rank()
        if new_rank:
            # Send notification
            try:
                Notification = apps.get_model('notifications', 'Notification')
                Notification.objects.create(
                    user=user,
                    title=f"🎖️ RANK UP! You are now {new_rank.upper()}",
                    message="A new path has opened. Explore your next Arc in the Ascension Map.",
                    type='rank_up'
                )
            except:
                pass
            
            instance.arc_unlock_processed = True
            instance.save(update_fields=['arc_unlock_processed'])