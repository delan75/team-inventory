from django.db import transaction
from django.core.exceptions import ValidationError
from decimal import Decimal
from .repositories import SalesRepository
from .models import Sale
from apps.inventory.models import StockMovement
from apps.inventory.services import InventoryService
from apps.products.repositories import ProductRepository

class SalesService:
    def __init__(self):
        self.repo = SalesRepository()
        self.inventory_service = InventoryService()
        self.product_repo = ProductRepository()

    def process_sale(self, user, shop_id, items_data, payment_data, customer_id=None):
        """
        items_data: list of dicts {'product_id': uuid, 'quantity': int, 'price': decimal}
        payment_data: {'amount_paid': decimal, 'method': str}
        """
        with transaction.atomic():
            # 1. Calculate totals
            total_amount = Decimal('0.00')
            for item in items_data:
                total_amount += Decimal(str(item['quantity'])) * Decimal(str(item['price']))
            
            amount_paid = Decimal(str(payment_data.get('amount_paid', 0)))
            method = payment_data.get('method', Sale.PaymentMethod.CASH)
            
            # 2. Handle Customer & Debt
            customer = None
            if customer_id:
                customer = self.repo.get_customer_by_id(customer_id)
            
            status = Sale.Status.COMPLETED
            if amount_paid < total_amount:
                # Credit Sale
                if not customer and amount_paid < total_amount:
                    raise ValidationError("Customer required for credit sales (partial payment)")
                status = Sale.Status.PENDING
                
                # Add debt to customer
                debt_amount = total_amount - amount_paid
                self.repo.update_customer_debt(customer, debt_amount)

            # 3. Create Sale Record
            sale = self.repo.create_sale(
                shop=user.owned_shops.first(), # Simplified for MVP, should verify shop ownership/membership
                seller=user,
                total_amount=total_amount,
                paid_amount=amount_paid,
                payment_method=method,
                customer=customer,
                status=status
            )
            
            # Hack: Fix shop assignment properly in Repo or View. Here we trust the View passed ID.
            sale.shop_id = shop_id
            sale.save()

            # 4. Create Items & Deduct Stock
            for item in items_data:
                product = self.product_repo.get_product_by_id(item['product_id'], shop_id)
                if not product:
                    raise ValidationError(f"Product {item['product_id']} not found")
                
                # Create Sale Item
                self.repo.create_sale_item(
                    sale=sale,
                    product=product,
                    quantity=item['quantity'],
                    price=item['price'] # Use price from request (allows discounts) or product.unit_price
                )

                # Deduct Stock
                self.inventory_service.record_transaction_movement(
                    shop=sale.shop,
                    product=product,
                    quantity=-item['quantity'],
                    movement_type='SALE',
                    performed_by=user,
                    reason=f"Sale #{str(sale.id)[:8]}",
                    reference_id=str(sale.id)
                )

            # 5. Record Initial Payment
            if amount_paid > 0:
                self.repo.create_payment(
                    sale=sale,
                    amount=amount_paid,
                    method=method,
                    recorded_by=user
                )

            return sale

    def add_payment(self, user, sale_id, amount, method):
        """
        Pay off a credit sale
        """
        with transaction.atomic():
            sale = Sale.objects.select_for_update().get(id=sale_id)
            amount = Decimal(str(amount))
            
            if sale.is_fully_paid:
                raise ValidationError("Sale is already fully paid")
            
            remaining = sale.remaining_balance
            if amount > remaining:
                raise ValidationError(f"Amount exceeds remaining balance ({remaining})")
            
            # Record Payment
            self.repo.create_payment(sale, amount, method, user)
            
            # Update Sale
            self.repo.update_sale_paid_amount(sale, amount)
            
            # Reduce Customer Debt
            if sale.customer:
                self.repo.update_customer_debt(sale.customer, -amount)
                
            return sale
