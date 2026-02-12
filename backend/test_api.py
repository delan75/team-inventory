from apps.products.models import Product
from apps.products.serializers import ProductListSerializer, ProductSerializer

# Get first product
p = Product.objects.first()
if p:
    print(f"ID: {p.id}")
    print(f"Name: {p.name}")
    print(f"Unit Price (model): {p.unit_price}")
    print(f"Cost Price (model): {p.cost_price}")
    print(f"Type: {type(p.unit_price)}")
    
    # Test serializers
    list_data = ProductListSerializer(p).data
    print(f"\nProductListSerializer output:")
    print(f"  unit_price: {list_data.get('unit_price')}")
    print(f"  cost_price: {list_data.get('cost_price')}")
    
    detail_data = ProductSerializer(p).data
    print(f"\nProductSerializer output:")
    print(f"  unit_price: {detail_data.get('unit_price')}")
    print(f"  cost_price: {detail_data.get('cost_price')}")
else:
    print("No products found")
