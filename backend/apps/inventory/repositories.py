from .models import StockMovement, InventoryAdjustment, PurchaseOrder, PurchaseItem
from django.utils import timezone

class InventoryRepository:
    @staticmethod
    def create_movement(shop, product, quantity, movement_type, performed_by=None, reason=None, reference_id=None):
        return StockMovement.objects.create(
            shop=shop,
            product=product,
            quantity=quantity,
            movement_type=movement_type,
            performed_by=performed_by,
            reason=reason,
            reference_id=reference_id
        )

    @staticmethod
    def create_adjustment(shop, product, old_qty, new_qty, performed_by=None, reason=None):
        return InventoryAdjustment.objects.create(
            shop=shop,
            product=product,
            old_quantity=old_qty,
            new_quantity=new_qty,
            performed_by=performed_by,
            reason=reason
        )

    @staticmethod
    def get_product_movements(product_id):
        return StockMovement.objects.filter(product_id=product_id).order_by('-created_at')

    @staticmethod
    def get_shop_movements(shop_id):
        return StockMovement.objects.filter(shop_id=shop_id).select_related('product', 'performed_by').order_by('-created_at')

class PurchaseRepository:
    @staticmethod
    def create_purchase_order(shop, created_by, supplier=None, notes=None):
        return PurchaseOrder.objects.create(
            shop=shop,
            created_by=created_by,
            supplier=supplier,
            notes=notes,
            status=PurchaseOrder.Status.PENDING
        )

    @staticmethod
    def add_item_to_order(order, product, quantity, cost):
        return PurchaseItem.objects.create(
            purchase_order=order,
            product=product,
            quantity=quantity,
            unit_cost=cost
        )

    @staticmethod
    def complete_order(order):
        order.status = PurchaseOrder.Status.COMPLETED
        order.completed_at = timezone.now()
        order.save()
        return order
    
    @staticmethod
    def get_orders_by_shop(shop_id):
        return PurchaseOrder.objects.filter(shop_id=shop_id).order_by('-created_at')
