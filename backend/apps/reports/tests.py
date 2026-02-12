from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.shops.models import Shop
from apps.products.models import Product, Category
from apps.sales.models import Sale, SaleItem, Customer
from decimal import Decimal

User = get_user_model()

class ReportsTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='test@example.com', password='password123', first_name='Test')
        self.shop = Shop.objects.create(name="Test Shop", owner=self.user)
        self.client.force_authenticate(user=self.user)
        self.category = Category.objects.create(name="Beverages", shop=self.shop)
        
        # Create test products
        self.product1 = Product.objects.create(
            name="Milk", sku="M1", shop=self.shop, category=self.category,
            unit_price=10, cost_price=7, current_stock=50, minimum_stock=10
        )
        self.product2 = Product.objects.create(
            name="Bread", sku="B1", shop=self.shop, category=self.category,
            unit_price=5, cost_price=3, current_stock=5, minimum_stock=10  # Low stock
        )
        self.product3 = Product.objects.create(
            name="Eggs", sku="E1", shop=self.shop, category=self.category,
            unit_price=20, cost_price=15, current_stock=0, minimum_stock=5  # Out of stock
        )
        
        # Create a sale
        self.sale = Sale.objects.create(
            shop=self.shop, total_amount=30, paid_amount=30, 
            status='COMPLETED', payment_method='CASH', seller=self.user
        )
        SaleItem.objects.create(sale=self.sale, product=self.product1, quantity=2, price_at_sale=10, total=20)
        SaleItem.objects.create(sale=self.sale, product=self.product2, quantity=2, price_at_sale=5, total=10)

    def test_dashboard_summary(self):
        url = reverse('report-dashboard') + f'?shop_id={self.shop.id}'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('sales', response.data['data'])
        self.assertIn('alerts', response.data['data'])
        self.assertIn('credit', response.data['data'])

    def test_sales_report(self):
        url = reverse('report-sales') + f'?shop_id={self.shop.id}'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('totals', response.data['data'])
        self.assertEqual(response.data['data']['totals']['total_transactions'], 1)

    def test_inventory_valuation(self):
        url = reverse('report-inventory-valuation') + f'?shop_id={self.shop.id}'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('summary', response.data['data'])
        # Milk: 50*7=350, Bread: 5*3=15, Eggs: 0*15=0 = 365
        self.assertEqual(response.data['data']['summary']['total_cost_value'], 365.0)

    def test_stock_alerts(self):
        url = reverse('report-stock-alerts') + f'?shop_id={self.shop.id}'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Bread is low stock, Eggs is out of stock
        self.assertEqual(response.data['data']['summary']['low_stock_count'], 1)
        self.assertEqual(response.data['data']['summary']['out_of_stock_count'], 1)

    def test_top_products(self):
        url = reverse('report-top-products') + f'?shop_id={self.shop.id}'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('by_quantity', response.data['data'])
        self.assertIn('by_revenue', response.data['data'])
