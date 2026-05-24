"""
TRANSFINITY Treasure Hunt - Integrated Django Signals
Path: backend/apps/treasurehunt/signals.py

Handles:
1. Purchase completion → Community unlock progress
2. Community threshold reached → Arc unlock for all contributors
3. Legacy T-shirt QR auto-generation on order completion
4. User progress creation on signup
5. Cache invalidation
"""

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver, Signal
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.utils import timezone
from django.apps import apps
import logging

logger = logging.getLogger(__name__)

# ===== CUSTOM SIGNALS =====
arc_unlocked = Signal()           # sender, user, arc
challenge_completed = Signal()  # sender, user, challenge
treasure_claimed = Signal()      # sender, user, treasure
community_threshold_reached = Signal()  # sender, arc, progress, triggering_purchase
user_rank_up = Signal()          # sender, user, old_rank, new_rank
purchase_contributed = Signal()  # sender, purchase, arc, progress


# ===== HELPER: Lazy model imports to avoid AppRegistryNotReady =====

def get_arc_model():
    return apps.get_model('treasurehunt', 'Arc')

def get_community_progress_model():
    return apps.get_model('treasurehunt', 'CommunityUnlockProgress')

def get_founder_progress_model():
    return apps.get_model('treasurehunt', 'FounderProgress')

def get_purchase_log_model():
    return apps.get_model('treasurehunt', 'PurchaseLog')

def get_treasure_claim_model():
    return apps.get_model('treasurehunt', 'TreasureClaim')

def get_tshirt_qr_model():
    return apps.get_model('treasurehunt', 'TShirtQRCode')


# ═════════════════════════════════════════════════════════════════
# 1. PURCHASE COMPLETION → COMMUNITY UNLOCK
# ═════════════════════════════════════════════════════════════════

@receiver(post_save, sender='treasurehunt.PurchaseLog')
def handle_purchase_completed(sender, instance, created, **kwargs):
    """
    When a purchase is marked as 'completed', automatically update
    community unlock progress. This is the CORE signal connecting
    your e-commerce to the treasure hunt progression.

    Flow:
    Purchase marked complete → Find next locked community arc →
    Increment progress → Check threshold → Unlock arc if reached
    """
    if instance.status != 'completed':
        return

    # Only process once
    if instance.arc_contribution is not None:
        return

    try:
        Arc = get_arc_model()
        CommunityUnlockProgress = get_community_progress_model()
        FounderProgress = get_founder_progress_model()
        User = get_user_model()

        # Find the next locked arc that uses community-based unlocking
        # Priority: hidden (not revealed) first, then revealed but locked
        next_arc = Arc.objects.filter(
            unlock_type='community',
            is_revealed=False,
            is_active=True
        ).order_by('arc_number').first()

        if not next_arc:
            next_arc = Arc.objects.filter(
                unlock_type='community',
                is_revealed=True,
                is_active=True
            ).order_by('arc_number').first()

        if not next_arc:
            logger.info(f"[Signals] No community-gated arcs for purchase {instance.order_id}")
            return

        # Get or create community progress
        progress, _ = CommunityUnlockProgress.objects.get_or_create(
            arc=next_arc,
            defaults={
                'target_purchases': next_arc.unlock_threshold or next_arc.sales_target or 100,
                'sales_target': next_arc.sales_target or 1000,
            }
        )

        # Increment progress
        was_unlocked = progress.is_unlocked
        is_now_unlocked = progress.increment(instance.user_id, amount=1)

        # Check milestones
        milestones = progress.check_milestones()

        # Link purchase to contribution
        instance.arc_contribution = progress
        instance.completed_at = timezone.now()
        instance.save(update_fields=['arc_contribution', 'completed_at'])

        # Fire contribution signal
        purchase_contributed.send(
            sender=CommunityUnlockProgress,
            purchase=instance,
            arc=next_arc,
            progress=progress
        )

        # If arc just unlocked, fire threshold signal
        if not was_unlocked and is_now_unlocked:
            community_threshold_reached.send(
                sender=CommunityUnlockProgress,
                arc=next_arc,
                progress=progress,
                triggering_purchase=instance
            )
            logger.info(
                f"[Signals] 🎉 ARC UNLOCKED: '{next_arc.name}' by community! "
                f"Purchases: {progress.current_purchases}/{progress.target_purchases}"
            )

        # Award XP to purchaser
        try:
            user_progress, _ = FounderProgress.objects.get_or_create(user=instance.user)
            if hasattr(instance.user, 'add_xp'):
                xp_earned = instance.user.add_xp(50)
            else:
                # Fallback: just log it
                xp_earned = 50
            logger.info(
                f"[Signals] Purchase {instance.order_id} contributed to {next_arc.name}. "
                f"Progress: {progress.current_purchases}/{progress.target_purchases}. "
                f"XP: +{xp_earned}"
            )
        except Exception as e:
            logger.warning(f"[Signals] Could not award XP: {e}")

    except Exception as e:
        logger.error(f"[Signals] Error processing purchase {instance.order_id}: {e}", exc_info=True)


@receiver(community_threshold_reached)
def handle_community_unlock(sender, arc, progress, triggering_purchase, **kwargs):
    """
    When community threshold is reached:
    1. Unlock arc for ALL contributing users
    2. Award bonus XP
    3. Cache the event
    4. TODO: Send WebSocket/push notifications
    """
    User = get_user_model()
    FounderProgress = get_founder_progress_model()

    unlocked_count = 0
    for user_id in progress.contributing_users:
        try:
            user = User.objects.get(id=user_id)
            user_progress, _ = FounderProgress.objects.get_or_create(user=user)

            # Visit/unlock the arc
            user_progress.visit_arc(arc)
            user_progress.visited_arcs.add(arc)

            # Bonus XP for being part of the unlock
            if hasattr(user, 'add_xp'):
                bonus_xp = user.add_xp(200)
            else:
                bonus_xp = 200

            unlocked_count += 1
            logger.info(f"[Signals] Unlocked {arc.name} for {user} (+{bonus_xp} XP)")

        except User.DoesNotExist:
            continue
        except Exception as e:
            logger.error(f"[Signals] Error unlocking arc for user {user_id}: {e}")

    # Cache the unlock event for real-time frontend updates
    cache_key = f"arc_unlocked:{arc.arc_key}"
    cache.set(cache_key, {
        'arc_key': arc.arc_key,
        'arc_name': arc.name,
        'unlocked_at': progress.unlocked_at.isoformat() if progress.unlocked_at else None,
        'total_purchases': progress.current_purchases,
        'contributors': len(progress.contributing_users),
        'users_unlocked': unlocked_count,
    }, timeout=3600)

    # TODO: WebSocket notification
    # from channels.layers import get_channel_layer
    # channel_layer = get_channel_layer()
    # async_to_sync(channel_layer.group_send)(
    #     "world_map",
    #     {"type": "arc_unlocked", "arc_key": arc.arc_key}
    # )


# ═════════════════════════════════════════════════════════════════
# 2. USER PROGRESS SIGNALS
# ═════════════════════════════════════════════════════════════════

@receiver(post_save, sender=get_user_model())
def create_founder_progress(sender, instance, created, **kwargs):
    """Create FounderProgress when a new user signs up."""
    if created:
        try:
            FounderProgress = get_founder_progress_model()
            Arc = get_arc_model()

            progress = FounderProgress.objects.create(user=instance)

            # Auto-unlock first arc
            first_arc = Arc.objects.filter(arc_number=1).first()
            if first_arc:
                progress.visit_arc(first_arc)
                progress.current_arc = first_arc
                progress.save(update_fields=['current_arc'])

                logger.info(f"[Signals] Created FounderProgress for {instance}, unlocked Arc 1")
        except Exception as e:
            logger.error(f"[Signals] Error creating FounderProgress: {e}")


# ═════════════════════════════════════════════════════════════════
# 3. LEGACY: T-SHIRT QR AUTO-GENERATION
# ═════════════════════════════════════════════════════════════════

@receiver(post_save)
def auto_generate_tshirt_qr(sender, instance, created, **kwargs):
    """
    Auto-generate QR code when order is confirmed/paid and contains T-shirt.
    Uses lazy imports to avoid AppRegistryNotReady.
    """
    # Check if sender is Order model
    try:
        Order = apps.get_model('orders', 'Order')
        if sender != Order:
            return
    except LookupError:
        return  # orders app not installed

    # Only trigger on status change to confirmed/paid/delivered
    if instance.status not in ['confirmed', 'paid', 'delivered', 'processing']:
        return

    try:
        TShirtQRCode = get_tshirt_qr_model()
    except LookupError:
        return  # model not available

    # Check if QR already exists
    if TShirtQRCode.objects.filter(order=instance).exists():
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

            if any(kw in product_name for kw in ['t-shirt', 'tshirt', 't shirt', 'tee']):
                has_tshirt = True
                break
            if any(kw in category_name for kw in ['t-shirt', 'tshirt', 't shirt', 'tee']):
                has_tshirt = True
                break
    except Exception as e:
        logger.warning(f"[Signals] Error checking T-shirt in order: {e}")
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
            logger.info(f"[Signals] ✅ QR auto-generated for order {instance.id}: {secret}")
        except Exception as e:
            logger.error(f"[Signals] ❌ QR generation failed: {e}")


# ═════════════════════════════════════════════════════════════════
# 4. CACHE INVALIDATION
# ═════════════════════════════════════════════════════════════════

@receiver(post_save, sender='treasurehunt.Arc')
def invalidate_arc_cache(sender, instance, **kwargs):
    """Invalidate world map cache when arc data changes."""
    cache.delete('world_map_data')
    cache.delete(f'arc_detail:{instance.arc_key}')
    logger.debug(f"[Signals] Cache invalidated for arc {instance.arc_key}")


@receiver(post_save, sender='treasurehunt.CommunityUnlockProgress')
def invalidate_progress_cache(sender, instance, **kwargs):
    """Invalidate cache when community progress changes."""
    cache.delete('world_map_data')
    cache.delete(f'community_progress:{instance.arc.arc_key}')


@receiver(post_delete, sender='treasurehunt.Arc')
def invalidate_on_arc_delete(sender, instance, **kwargs):
    cache.delete('world_map_data')


# ═════════════════════════════════════════════════════════════════
# 5. TREASURE CLAIM SIGNAL
# ═════════════════════════════════════════════════════════════════

@receiver(post_save, sender='treasurehunt.TreasureClaim')
def handle_treasure_claim(sender, instance, created, **kwargs):
    """When a treasure is claimed, update user progress and fire signal."""
    if not created:
        return

    try:
        FounderProgress = get_founder_progress_model()
        progress, _ = FounderProgress.objects.get_or_create(user=instance.user)
        progress.discover_treasure(instance.treasure)

        treasure_claimed.send(
            sender=TreasureClaim,
            user=instance.user,
            treasure=instance.treasure
        )

        logger.info(f"[Signals] {instance.user} claimed treasure: {instance.treasure.name}")
    except Exception as e:
        logger.error(f"[Signals] Error handling treasure claim: {e}")