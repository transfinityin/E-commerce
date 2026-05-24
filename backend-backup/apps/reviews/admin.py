from django.contrib import admin
from apps.reviews.models import Review
# Register your models here.

# ── Reviews ───────────────────────────────────────────────────
@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display  = ('user', 'product', 'rating', 'is_verified', 'created_at')
    list_filter   = ('rating', 'is_verified')
    search_fields = ('user__email', 'product__name')
    list_editable = ('is_verified',)
 
 