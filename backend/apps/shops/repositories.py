from .models import Shop, ShopMember

class ShopRepository:
    @staticmethod
    def get_shop_by_id(shop_id):
        try:
            return Shop.objects.get(id=shop_id)
        except Shop.DoesNotExist:
            return None

    @staticmethod
    def get_user_memberships(user):
        return ShopMember.objects.filter(user=user, is_active=True).select_related('shop')

    @staticmethod
    def create_shop(name, owner, **kwargs):
        shop = Shop.objects.create(name=name, owner=owner, **kwargs)
        # Owner is automatically added as a member with OWNER role
        ShopMember.objects.create(shop=shop, user=owner, role=ShopMember.Role.OWNER)
        return shop

    @staticmethod
    def add_member(shop, user, role):
        return ShopMember.objects.create(shop=shop, user=user, role=role)

    @staticmethod
    def remove_member(shop, user):
        ShopMember.objects.filter(shop=shop, user=user).delete()
    
    @staticmethod
    def is_user_member(shop, user):
        return ShopMember.objects.filter(shop=shop, user=user, is_active=True).exists()
