from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Shop
from .services import ShopService

User = get_user_model()

class ShopTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='test@example.com', password='password123', first_name='Test')
        self.client.force_authenticate(user=self.user)
        self.url = reverse('shop-list-create')
        self.service = ShopService()

    def test_create_shop_valid(self):
        data = {'name': 'My Shop', 'currency': 'ZAR'}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Shop.objects.count(), 1)
        self.assertEqual(Shop.objects.get().owner, self.user)

    def test_create_shop_invalid(self):
        data = {'currency': 'ZAR'} # Missing name
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_shops(self):
        self.service.create_shop(self.user, {"name": "Shop 1"})
        self.service.create_shop(self.user, {"name": "Shop 2"})
        
        other_user = User.objects.create_user(email='other@example.com', password='password123')
        self.service.create_shop(other_user, {"name": "Other Shop"})

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2) # Should only see own shops
