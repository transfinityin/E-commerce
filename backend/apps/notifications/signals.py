from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import Notification
from .utils import send_notification_email
from django.apps import apps

from backend.apps.utils.google_sheets import log_to_sheet
GOOGLE_SHEET_ID = "1Cg0WdYbJSzrbzviaKmZ-NBXzvf_QgpTGoXw6o2aARfQ"
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
    
    if created:
        return
    
    if getattr(instance, 'status', None) != 'delivered':
        return
    
    if getattr(instance, 'arc_unlock_processed', False):
        return
    
    user = instance.user
    
    try:
        products = instance.items.all().values_list('product__arc_type', flat=True)
    except Exception:
        return
    
    rank_requirements = {
        'wanderer': 'wanderer',
        'founder': 'founder',
        'ascendant': 'ascendant',
        'phantom': 'phantom',
        'eclipse': 'eclipse',
    }
    
    required_arc = rank_requirements.get(user.rank)
    
    if required_arc and required_arc in products:
        new_rank = user.unlock_next_rank()
        if new_rank:
            Notification = apps.get_model('notifications', 'Notification')
            Notification.objects.create(
                user=user,
                type='rank_up',
                title=f"🎖️ RANK UP! You are now {new_rank.upper()}",
                message="A new path has opened. Explore your next Arc in the Ascension Map.",
                link='/ascension-map'
            )
            instance.arc_unlock_processed = True
            instance.save(update_fields=['arc_unlock_processed'])

