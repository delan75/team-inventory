from django.db import transaction
from django.core.exceptions import ValidationError
from django.db.models import Sum
from .repositories import InventoryRepository, PurchaseRepository
from .models import StockMovement, PurchaseOrder
from apps.products.repositories import ProductRepository, Product
from decimal import Decimal

class InventoryService:
    def __init__(self):
        self.repo = InventoryRepository()
        self.product_repo = ProductRepository()

    def adjust_stock(self, user, product_id, new_quantity, reason=None):
        """
        Manually sets stock to a specific value.
        Calculates difference and logs MOVEMENT and ADJUSTMENT.
        Atomic transaction ensures integrity.
        """
        with transaction.atomic():
            # Lock product row for update to prevent race conditions
            product = Product.objects.select_for_update().get(id=product_id)
            
            old_quantity = product.current_stock
            difference = new_quantity - old_quantity
            
            if difference == 0:
                return product

            # Update product stock
            product.current_stock = new_quantity
            product.save()

            # Record Adjustment (Snapshot)
            self.repo.create_adjustment(
                shop=product.shop,
                product=product,
                old_qty=old_quantity,
                new_qty=new_quantity,
                performed_by=user,
                reason=reason
            )

            # Record Stock Movement (Delta)
            movement_type = StockMovement.MovementType.ADJUSTMENT
            self.repo.create_movement(
                shop=product.shop,
                product=product,
                quantity=difference,
                movement_type=movement_type,
                performed_by=user,
                reason=reason
            )
            
            return product

    def record_transaction_movement(self, shop, product, quantity, movement_type, performed_by=None, reason=None, reference_id=None):
        """
        Used by Sales/Purchase services to update stock.
        """
        with transaction.atomic():
             # Lock product row
            product = Product.objects.select_for_update().get(id=product.id)
            
            # Update stock
            product.current_stock += quantity
            product.save()

            # Log movement
            self.repo.create_movement(
                shop=shop,
                product=product,
                quantity=quantity,
                movement_type=movement_type,
                performed_by=performed_by,
                reason=reason,
                reference_id=reference_id
            )
            return product

class PurchaseService:
    def __init__(self):
        self.repo = PurchaseRepository()
        self.inventory_service = InventoryService()
        self.product_repo = ProductRepository()

    def create_purchase_order(self, user, shop_id, supplier_id, items_data, notes=None):
        """
        Creates a PO. Does NOT update stock yet (Status=PENDING).
        """
        with transaction.atomic():
            # Create Order
            # Simplify: we need supplier obj
            from apps.products.models import Supplier
            supplier = None
            if supplier_id:
                supplier = Supplier.objects.get(id=supplier_id)

            shop = user.owned_shops.first() # Fix: use shop_id properly
            from apps.shops.models import Shop
            shop = Shop.objects.get(id=shop_id)

            order = self.repo.create_purchase_order(shop, user, supplier, notes)
            
            total_cost = Decimal('0.00')
            
            # Create Items
            for item in items_data:
                product = self.product_repo.get_product_by_id(item['product_id'], shop_id)
                if not product:
                    raise ValidationError(f"Product {item['product_id']} not found")
                
                qty = item['quantity']
                cost = Decimal(str(item['cost']))
                
                self.repo.add_item_to_order(order, product, qty, cost)
                total_cost += (qty * cost)
            
            order.total_cost = total_cost
            order.save()
            return order

    def complete_purchase_order(self, user, order_id):
        """
        Marks PO as completed and INCREASES stock for all items.
        """
        with transaction.atomic():
            order = PurchaseOrder.objects.select_for_update().get(id=order_id)
            
            if order.status != PurchaseOrder.Status.PENDING:
                raise ValidationError("Order is not pending")
            
            # Update Stock for each item
            for item in order.items.all():
                self.inventory_service.record_transaction_movement(
                    shop=order.shop,
                    product=item.product,
                    quantity=item.quantity,
                    movement_type=StockMovement.MovementType.PURCHASE,
                    performed_by=user,
                    reason=f"PO #{str(order.id)[:8]}",
                    reference_id=str(order.id)
                )
                
                # Update product cost price? Optional business logic.
                # Update product cost price using update() to avoid overwriting stock
                Product.objects.filter(id=item.product.id).update(cost_price=item.unit_cost)

            self.repo.complete_order(order)
            return order
