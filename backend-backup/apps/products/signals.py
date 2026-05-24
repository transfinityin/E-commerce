from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.postgres.search import SearchVector
from .models import Product


@receiver(post_save, sender=Product)
def update_search_vector(sender, instance, **kwargs):
    """Auto-update search index when product saved."""
    Product.objects.filter(pk=instance.pk).update(
        search_vector=(
            SearchVector('name',        weight='A', config='english') +
            SearchVector('tags',        weight='A', config='english') +
            SearchVector('description', weight='B', config='english')
        )
    )