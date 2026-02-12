import os
import sys
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
django.setup()

from apps.products.models import Product
from apps.shops.models import Shop
from decimal import Decimal

print("=" * 60)
print("DATABASE PRODUCT VERIFICATION")
print("=" * 60)

# Get shop
shop = Shop.objects.first()
if not shop:
    print("ERROR: No shop found in database!")
    sys.exit(1)

print(f"\nShop: {shop.name} (ID: {shop.id})")
print(f"Total products: {Product.objects.filter(shop=shop).count()}")

# Show all products with their prices
products = Product.objects.filter(shop=shop).order_by('-created_at')[:5]

for p in products:
    print(f"\n{'=' * 60}")
    print(f"Product: {p.name}")
    print(f"  ID: {p.id}")
    print(f"  SKU: {p.sku}")
    print(f"  Created: {p.created_at}")
    print(f"  ---")
    print(f"  unit_price (DB): {p.unit_price}")
    print(f"  unit_price type: {type(p.unit_price)}")
    print(f"  cost_price (DB): {p.cost_price}")
    print(f"  tax_rate (DB): {p.tax_rate}")
    print(f"  current_stock: {p.current_stock}")
    print(f"  minimum_stock: {p.minimum_stock}")
    print(f"  is_active: {p.is_active}")
    print(f"  ---")
    
    # Test if price is actually zero or empty
    if p.unit_price == Decimal('0.00'):
        print("  WARNING: unit_price is exactly 0.00")
    else:
        print(f"  OK - Price: R{p.unit_price}")

print(f"\n{'=' * 60}")
print("TESTING RAW SQL")
print("=" * 60)

from django.db import connection
with connection.cursor() as cursor:
    cursor.execute("""
        SELECT name, sku, unit_price, cost_price, tax_rate, current_stock
        FROM products_product 
        WHERE shop_id = %s
        ORDER BY created_at DESC
        LIMIT 3
    """, [str(shop.id)])
    
    rows = cursor.fetchall()
    print("\nRaw SQL Results:")
    for row in rows:
        print(f"  {row[0]}: unit_price={row[2]}, cost_price={row[3]}")
