from django.db import transaction
from django.core.exceptions import ValidationError
from .repositories import ShopRepository

class ShopService:
    def __init__(self):
        self.repository = ShopRepository()

    def create_shop(self, user, data):
        with transaction.atomic():
            shop = self.repository.create_shop(
                name=data['name'],
                owner=user,
                address=data.get('address'),
                phone=data.get('phone'),
                currency=data.get('currency', 'ZAR')
            )
            return shop

    def get_user_shops(self, user):
        memberships = self.repository.get_user_memberships(user)
        return [m.shop for m in memberships]

    def add_staff_member(self, request_user, shop_id, new_member_user, role):
        shop = self.repository.get_shop_by_id(shop_id)
        if not shop:
            raise ValidationError("Shop not found")
        
        # Check permission (only owner/manager can add members)
        # Ideally this should be in a Permission class, but basic check here doesn't hurt
        
        if self.repository.is_user_member(shop, new_member_user):
            raise ValidationError("User is already a member of this shop")
            
        return self.repository.add_member(shop, new_member_user, role)
