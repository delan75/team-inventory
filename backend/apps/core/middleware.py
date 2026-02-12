"""
Shop Context Middleware

This middleware extracts the shop context from the X-Shop-ID header and 
attaches it to the request object. It also validates that the user has
access to the specified shop.

Usage in React Native:
    fetch('/api/v1/products/', {
        headers: {
            'Authorization': 'Bearer <token>',
            'X-Shop-ID': '<shop-uuid>'
        }
    })
"""
from django.http import JsonResponse
from apps.shops.models import Shop, ShopMember


class ShopContextMiddleware:
    """
    Middleware to handle shop context via X-Shop-ID header.
    
    Priority:
    1. X-Shop-ID header (production approach)
    2. shop_id query parameter (fallback for debugging)
    3. User's first owned shop (convenience for single-shop users)
    4. User's first membership shop
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        # Skip for non-API routes or unauthenticated requests
        if not request.path.startswith('/api/') or not hasattr(request, 'user') or not request.user.is_authenticated:
            return self.get_response(request)
        
        # Skip for auth endpoints (they don't need shop context)
        if '/api/v1/auth/' in request.path:
            return self.get_response(request)
            
        # Skip for shop list/create endpoint (user may not have a shop yet)
        if request.path == '/api/v1/shops/' and request.method in ['GET', 'POST']:
            return self.get_response(request)
        
        shop_id = self._get_shop_id(request)
        shop = None
        
        if shop_id:
            try:
                shop = Shop.objects.get(id=shop_id)
                # Validate user has access
                if not self._user_has_access(request.user, shop):
                    return JsonResponse(
                        {'success': False, 'error': {'code': 'FORBIDDEN', 'message': 'You do not have access to this shop'}},
                        status=403
                    )
            except Shop.DoesNotExist:
                return JsonResponse(
                    {'success': False, 'error': {'code': 'NOT_FOUND', 'message': 'Shop not found'}},
                    status=404
                )
        
        # Attach to request
        request.shop = shop
        request.shop_id = shop.id if shop else None
        
        return self.get_response(request)
    
    def _get_shop_id(self, request):
        """Extract shop_id from header, query param, or user's shops."""
        # 1. Header (preferred)
        shop_id = request.headers.get('X-Shop-ID')
        if shop_id:
            return shop_id
            
        # 2. Query parameter (fallback)
        shop_id = request.GET.get('shop_id')
        if shop_id:
            return shop_id
            
        # 3. User's first owned shop
        shop = request.user.owned_shops.first()
        if shop:
            return str(shop.id)
            
        # 4. User's first membership
        membership = request.user.shop_memberships.first()
        if membership:
            return str(membership.shop.id)
            
        return None
    
    def _user_has_access(self, user, shop):
        """Check if user owns or is a member of the shop."""
        if shop.owner == user:
            return True
        return shop.members.filter(user=user, is_active=True).exists()
