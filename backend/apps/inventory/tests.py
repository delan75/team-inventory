from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.shops.models import Shop
from apps.products.models import Product, Category
from .models import StockMovement, PurchaseOrder

User = get_user_model()

class InventoryTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='test@example.com', password='password123', first_name='Test')
        self.shop = Shop.objects.create(name="Test Shop", owner=self.user)
        self.client.force_authenticate(user=self.user)
        self.category = Category.objects.create(name="General", shop=self.shop)
        self.product = Product.objects.create(name="Milk", sku="M1", shop=self.shop, category=self.category, unit_price=10, current_stock=0)

    def test_adjust_inventory_params(self):
        url = reverse('inventory-adjust') + f'?shop_id={self.shop.id}'
        data = {
            'product_id': self.product.id,
            'new_quantity': 50,
            'reason': 'Stock Count'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.product.refresh_from_db()
        self.assertEqual(self.product.current_stock, 50)
        self.assertEqual(StockMovement.objects.count(), 1)
        self.assertEqual(StockMovement.objects.first().quantity, 50) # 0 -> 50 = +50 diff

    def test_purchase_order_flow(self):
        # 1. Create PO
        url_create = reverse('purchase-list-create') + f'?shop_id={self.shop.id}'
        data = {
            'items': [{'product_id': self.product.id, 'quantity': 100, 'cost': 5.00}],
            'notes': 'Restock'
        }
        response = self.client.post(url_create, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        po_id = response.data['data']['id']  # Access nested data

        # Verify Stock unchanged
        self.product.refresh_from_db()
        self.assertEqual(self.product.current_stock, 0)

        # 2. Complete PO
        url_complete = reverse('purchase-complete', args=[po_id]) 
        response = self.client.post(url_complete, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['status'], 'COMPLETED')  # Access nested data

        # Verify Stock Updated
        self.product.refresh_from_db()
        self.assertEqual(self.product.current_stock, 100)
