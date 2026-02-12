from rest_framework import permissions

class IsShopOwner(permissions.BasePermission):
    """
    Allows access only to the owner of the shop.
    Assumes 'shop' object is available in view or looked up via lookup_field.
    """
    def has_object_permission(self, request, view, obj):
        # If obj is Shop:
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        # If obj matches via shop FK:
        if hasattr(obj, 'shop'):
            return obj.shop.owner == request.user
        return False

class IsShopManager(permissions.BasePermission):
    """
    Allows access to Owners and Managers of the shop.
    """
    def has_object_permission(self, request, view, obj):
        shop = obj if hasattr(obj, 'owner') else getattr(obj, 'shop', None)
        if not shop:
            return False
            
        # Check Owner
        if shop.owner == request.user:
            return True
        
        # Check Member Role
        membership = shop.members.filter(user=request.user, is_active=True).first()
        if not membership:
            return False
            
        return membership.role in ['OWNER', 'MANAGER']

class IsShopStaff(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        shop = obj if hasattr(obj, 'owner') else getattr(obj, 'shop', None)
        if not shop:
            return False

        if shop.owner == request.user:
            return True

        return shop.members.filter(user=request.user, is_active=True).exists()
