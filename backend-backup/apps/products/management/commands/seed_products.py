import random
import uuid
import requests

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from django.contrib.auth import get_user_model

from apps.products.models import Product, Category, ProductImage
from apps.orders.models import OrderItem, Order
from apps.cart.models import CartItem, Cart
from apps.wishlist.models import Wishlist


class Command(BaseCommand):
    help = "Create 100 men's fashion products with related images"

    def handle(self, *args, **kwargs):
        User = get_user_model()
        user = User.objects.first()

        if not user:
            self.stdout.write(self.style.ERROR("Create superuser first: python manage.py createsuperuser"))
            return

        self.stdout.write("Cleaning old data...")

        OrderItem.objects.all().delete()
        Order.objects.all().delete()
        CartItem.objects.all().delete()
        Cart.objects.all().delete()
        Wishlist.objects.all().delete()

        for img in ProductImage.objects.all():
            img.image.delete(save=False)
            img.delete()

        Product.objects.all().delete()
        Category.objects.all().delete()

        product_data = {
            "T-Shirts": [
                "Plain Cotton T-Shirt",
                "Oversized T-Shirt",
                "Graphic Printed T-Shirt",
                "Polo Neck T-Shirt",
                "Round Neck T-Shirt",
            ],
            "Shirts": [
                "Casual Cotton Shirt",
                "Formal Slim Fit Shirt",
                "Checked Shirt",
                "Denim Shirt",
                "Linen Shirt",
            ],
            "Shorts": [
                "Denim Shorts",
                "Cotton Casual Shorts",
                "Gym Training Shorts",
                "Cargo Shorts",
                "Running Shorts",
            ],
            "Track Pants": [
                "Slim Fit Track Pants",
                "Jogger Track Pants",
                "Sports Track Pants",
                "Cotton Track Pants",
                "Training Track Pants",
            ],
            "Jeans": [
                "Slim Fit Jeans",
                "Regular Fit Jeans",
                "Black Denim Jeans",
                "Blue Washed Jeans",
                "Straight Fit Jeans",
            ],
            "Casual Pants": [
                "Chino Pants",
                "Cargo Pants",
                "Cotton Casual Pants",
                "Relaxed Fit Pants",
                "Stretchable Pants",
            ],
        }

        categories = {}

        for category_name in product_data.keys():
            category = Category.objects.create(
                name=category_name,
                slug=slugify(category_name),
                is_active=True,
            )
            categories[category_name] = category

        created_count = 0

        while created_count < 100:
            category_name = random.choice(list(product_data.keys()))
            product_name = random.choice(product_data[category_name])

            name = f"Men {product_name} {created_count + 1}"
            price = random.randint(699, 3499)
            sale_price = random.randint(499, price - 50)

            product = Product.objects.create(
                owner=user,
                category=categories[category_name],
                name=name,
                slug=slugify(f"{name}-{uuid.uuid4().hex[:6]}"),
                description=f"Premium quality {name.lower()} for men. Comfortable, stylish and perfect for daily wear.",
                price=price,
                sale_price=sale_price,
                stock=random.randint(10, 100),
                sku=f"MEN-{created_count + 1}-{random.randint(1000, 9999)}",
                weight=round(random.uniform(0.2, 1.5), 2),
                is_active=True,
                is_featured=random.choice([True, False]),
            )

            query = category_name.lower().replace(" ", ",")
            image_url = f"https://loremflickr.com/600/600/men,{query}?lock={created_count + 1}"

            try:
                response = requests.get(image_url, timeout=20)

                if response.status_code == 200:
                    ProductImage.objects.create(
                        product=product,
                        image=ContentFile(
                            response.content,
                            name=f"{product.slug}.jpg"
                        ),
                        alt_text=name,
                        is_primary=True,
                        sort_order=0,
                    )
                    self.stdout.write(self.style.SUCCESS(f"✅ {name} created with image"))
                else:
                    self.stdout.write(self.style.WARNING(f"⚠️ {name} created, image failed"))

            except Exception as e:
                self.stdout.write(self.style.WARNING(f"⚠️ Image error for {name}: {e}"))

            created_count += 1

        self.stdout.write(self.style.SUCCESS("🎉 100 men's fashion products created successfully"))