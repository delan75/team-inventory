from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.shops.models import Shop
from apps.products.models import Product, Category
from .models import Sale, Customer
from decimal import Decimal

User = get_user_model()

class SalesTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='test@example.com', password='password123', first_name='Test')
        self.shop = Shop.objects.create(name="Test Shop", owner=self.user)
        self.client.force_authenticate(user=self.user)
        self.category = Category.objects.create(name="General", shop=self.shop)
        self.product = Product.objects.create(name="Milk", sku="M1", shop=self.shop, category=self.category, unit_price=10, current_stock=10)
        self.url = reverse('sale-list-create') + f'?shop_id={self.shop.id}'

    def test_create_cash_sale(self):
        data = {
            'items': [{'product_id': self.product.id, 'quantity': 2, 'price': 10.00}],
            'payment': {'amount_paid': 20.00, 'method': 'CASH'}
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify Stock Deduction
        self.product.refresh_from_db()
        self.assertEqual(self.product.current_stock, 8) # 10 - 2

    def test_create_credit_sale_without_customer(self):
        # Should fail
        data = {
            'items': [{'product_id': self.product.id, 'quantity': 2, 'price': 10.00}],
            'payment': {'amount_paid': 0, 'method': 'CREDIT'}
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_credit_sale_with_customer(self):
        customer = Customer.objects.create(name="John", shop=self.shop)
        data = {
            'customer_id': customer.id,
            'items': [{'product_id': self.product.id, 'quantity': 2, 'price': 10.00}],
            'payment': {'amount_paid': 0, 'method': 'CREDIT'}
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['data']['status'], 'PENDING')  # Access nested data

        # Verify Debt
        customer.refresh_from_db()
        self.assertEqual(customer.current_debt, Decimal('20.00'))

    def test_repay_debt(self):
        # Setup credit sale
        customer = Customer.objects.create(name="John", shop=self.shop)
        sale = Sale.objects.create(shop=self.shop, customer=customer, total_amount=20, paid_amount=0, status='PENDING')
        customer.current_debt = 20
        customer.save()

        # Build url for payment
        pay_url = reverse('sale-add-payment', args=[sale.id])
        data = {'amount': 20.00, 'method': 'CASH'}
        
        response = self.client.post(pay_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify Sale Completed
        sale.refresh_from_db()
        self.assertEqual(sale.status, 'COMPLETED')
        self.assertTrue(sale.is_fully_paid)

        # Verify Debt Cleared
        customer.refresh_from_db()
        self.assertEqual(customer.current_debt, 0)
