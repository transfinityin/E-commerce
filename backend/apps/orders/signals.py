from django.db.models.signals import post_save
from django.dispatch import receiver
from django.apps import apps


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