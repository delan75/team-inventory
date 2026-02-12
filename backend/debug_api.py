import os
import sys
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
django.setup()

from apps.products.models import Product
from apps.products.serializers import ProductListSerializer, ProductSerializer

print("=" * 50)
print("PRODUCT API DEBUG")
print("=" * 50)

products = Product.objects.all()
print(f"\nTotal products: {products.count()}")

for p in products[:3]:
    print(f"\n--- Product: {p.name} ---")
    print(f"  DB unit_price: {p.unit_price} (type: {type(p.unit_price).__name__})")
    print(f"  DB cost_price: {p.cost_price}")
    
    list_data = ProductListSerializer(p).data
    print(f"  Serialized unit_price: {list_data.get('unit_price')}")
    print(f"  Serialized cost_price: {list_data.get('cost_price')}")
    print(f"  All fields: {list(list_data.keys())}")
