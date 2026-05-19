# D:\Chan\Transfinity\backend\apps\treasurehunt\apps.py

from django.apps import AppConfig

class TreasurehuntConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.treasurehunt'
    verbose_name = 'Treasure Hunt'

    def ready(self):
        # Import signals AFTER apps are ready
        import apps.treasurehunt.signals  # noqa: F401