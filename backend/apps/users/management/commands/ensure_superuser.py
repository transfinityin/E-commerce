import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Create a superuser from DJANGO_SUPERUSER_* env vars if missing."

    def handle(self, *args, **options):
        email = (os.getenv("DJANGO_SUPERUSER_EMAIL") or "").strip()
        password = os.getenv("DJANGO_SUPERUSER_PASSWORD") or ""
        name = (os.getenv("DJANGO_SUPERUSER_NAME") or "Admin").strip()

        if not email or not password:
            self.stdout.write("Skipping superuser seed (DJANGO_SUPERUSER_EMAIL/PASSWORD not set).")
            return

        User = get_user_model()
        if User.objects.filter(email__iexact=email).exists():
            self.stdout.write(f"Superuser already exists: {email}")
            return

        User.objects.create_superuser(email=email, password=password, name=name)
        self.stdout.write(self.style.SUCCESS(f"Created superuser: {email}"))
