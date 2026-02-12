"""
Shop Context Utilities

Provides a centralized way to extract shop context from requests.
Works with DRF Request objects.

Usage in React Native:
    fetch('/api/v1/products/', {
        headers: {
            'Authorization': 'Bearer <token>',
            'X-Shop-ID': '<shop-uuid>'
        }
    })

Usage in Views:
    from apps.core.shop_context import get_shop_context
    
    @api_view(['GET'])
    def my_view(request):
        shop, error_response = get_shop_context(request)
        if error_response:
            return error_response
        # Use shop.id, shop.name, etc.
"""
from apps.shops.models import Shop
from .responses import error_response, shop_required_response


def get_shop_context(request, required=True):
    """
    Extract shop context from the request.
    
    Priority:
    1. X-Shop-ID header (production approach)
    2. shop_id query parameter (fallback for debugging)
    3. User's first owned shop (convenience for single-shop users)
    4. User's first membership shop
    
    Args:
        request: DRF Request object
        required: If True and no shop found, return error response
        
    Returns:
        Tuple of (shop, error_response)
        - If shop found: (Shop instance, None)
        - If shop not found and required: (None, Response)
        - If shop not found and not required: (None, None)
    """
    shop_id = _extract_shop_id(request)
    
    if shop_id:
        try:
            shop = Shop.objects.get(id=shop_id)
            # Validate user has access
            if not _user_has_access(request.user, shop):
                return None, error_response(
                    'FORBIDDEN',
                    'You do not have access to this shop',
                    status_code=403
                )
            return shop, None
        except Shop.DoesNotExist:
            return None, error_response(
                'NOT_FOUND',
                'Shop not found',
                status_code=404
            )
    
    if required:
        return None, shop_required_response()
    
    return None, None


def get_shop_id(request):
    """
    Simple helper to just get the shop_id (for backward compatibility).
    Returns shop_id or None.
    """
    return _extract_shop_id(request)


def _extract_shop_id(request):
    """Extract shop_id from header, query param, or user's shops."""
    # 1. Header (preferred for production)
    shop_id = request.headers.get('X-Shop-ID') or request.META.get('HTTP_X_SHOP_ID')
    if shop_id:
        return shop_id
        
    # 2. Query parameter (fallback for debugging/Postman)
    shop_id = request.query_params.get('shop_id')
    if shop_id:
        return shop_id
        
    # 3. User's first owned shop (convenience for single-shop users)
    if hasattr(request, 'user') and request.user.is_authenticated:
        shop = request.user.owned_shops.first()
        if shop:
            return str(shop.id)
            
        # 4. User's first membership
        membership = request.user.shop_memberships.first()
        if membership:
            return str(membership.shop.id)
        
    return None


def _user_has_access(user, shop):
    """Check if user owns or is a member of the shop."""
    if shop.owner == user:
        return True
    return shop.members.filter(user=user, is_active=True).exists()
