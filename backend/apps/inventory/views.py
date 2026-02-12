from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .services import InventoryService, PurchaseService
from .repositories import InventoryRepository, PurchaseRepository
from .serializers import (
    StockMovementSerializer, InventoryAdjustmentSerializer, 
    PurchaseOrderSerializer, CreatePurchaseOrderSerializer
)
from apps.products.models import Product
from apps.core.responses import (
    success_response, created_response, validation_error_response, error_response
)
from apps.core.shop_context import get_shop_context


# Inventory Movement Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_inventory_movements(request):
    shop, error = get_shop_context(request)
    if error:
        return error
    
    repo = InventoryRepository()
    movements = repo.get_shop_movements(shop.id)
    
    product_id = request.query_params.get('product_id')
    if product_id:
        movements = movements.filter(product_id=product_id)
        
    serializer = StockMovementSerializer(movements, many=True)
    return success_response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def adjust_inventory(request):
    shop, error = get_shop_context(request)
    if error:
        return error

    serializer = InventoryAdjustmentSerializer(data=request.data)
    if serializer.is_valid():
        service = InventoryService()
        try:
            product = get_object_or_404(Product, id=serializer.validated_data['product_id'], shop_id=shop.id)
            service.adjust_stock(
                user=request.user,
                product_id=product.id,
                new_quantity=serializer.validated_data['new_quantity'],
                reason=serializer.validated_data.get('reason')
            )
            return success_response(message='Inventory adjusted successfully')
        except Exception as e:
            return error_response('ADJUSTMENT_ERROR', str(e))
    return validation_error_response(serializer.errors)


# Purchase Views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def list_create_purchase_orders(request):
    shop, error = get_shop_context(request)
    if error:
        return error

    if request.method == 'GET':
        repo = PurchaseRepository()
        orders = repo.get_orders_by_shop(shop.id)
        return success_response(PurchaseOrderSerializer(orders, many=True).data)

    elif request.method == 'POST':
        serializer = CreatePurchaseOrderSerializer(data=request.data)
        if serializer.is_valid():
            service = PurchaseService()
            try:
                order = service.create_purchase_order(
                    user=request.user,
                    shop_id=shop.id,
                    supplier_id=serializer.validated_data.get('supplier_id'),
                    items_data=serializer.validated_data['items'],
                    notes=serializer.validated_data.get('notes')
                )
                return created_response(PurchaseOrderSerializer(order).data, 'Purchase order created')
            except Exception as e:
                return error_response('CREATION_ERROR', str(e))
        return validation_error_response(serializer.errors)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_purchase_order(request, order_id):
    service = PurchaseService()
    try:
        order = service.complete_purchase_order(request.user, order_id)
        return success_response(PurchaseOrderSerializer(order).data, 'Purchase order completed')
    except Exception as e:
        return error_response('COMPLETION_ERROR', str(e))
