from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.shops.models import Shop
from .models import Product, Category

User = get_user_model()

class ProductTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='test@example.com', password='password123', first_name='Test')
        self.shop = Shop.objects.create(name="Test Shop", owner=self.user)
        self.client.force_authenticate(user=self.user)
        self.url = reverse('product-list-create') + f'?shop_id={self.shop.id}'
        self.category = Category.objects.create(name="General", shop=self.shop)

    def test_create_product_valid(self):
        data = {
            'name': 'Milk',
            'sku': 'MILK001',
            'category_id': self.category.id,
            'unit_price': 10.00
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.count(), 1)

    def test_create_product_duplicate_barcode(self):
        Product.objects.create(name="Milk", sku="M1", barcode="12345", shop=self.shop, category=self.category, unit_price=10)
        
        data = {
            'name': 'Bread', 
            'sku': 'B1', 
            'barcode': '12345', # Duplicate
            'category_id': self.category.id, 
            'unit_price': 5
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already exists', str(response.data))

    def test_search_product(self):
        Product.objects.create(name="Apple", sku="A1", barcode="111222", shop=self.shop, category=self.category, unit_price=1)
        Product.objects.create(name="Banana", sku="B1", barcode="333444", shop=self.shop, category=self.category, unit_price=1)
        
        # Search match
        response = self.client.get(self.url + '&search=111')
        self.assertEqual(len(response.data['data']), 1)  # Access nested data
        self.assertEqual(response.data['data'][0]['name'], 'Apple')

        # Search no match
        response = self.client.get(self.url + '&search=999')
        self.assertEqual(len(response.data['data']), 0)  # Access nested data
