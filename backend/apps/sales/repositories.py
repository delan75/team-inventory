from django.db.models import Sum
from .models import Sale, SaleItem, Payment, Customer

class SalesRepository:
    @staticmethod
    def create_sale(shop, seller, total_amount, paid_amount, payment_method, customer=None, status=Sale.Status.COMPLETED):
        return Sale.objects.create(
            shop=shop,
            seller=seller,
            total_amount=total_amount,
            paid_amount=paid_amount,
            payment_method=payment_method,
            customer=customer,
            status=status
        )

    @staticmethod
    def create_sale_item(sale, product, quantity, price):
        return SaleItem.objects.create(
            sale=sale,
            product=product,
            quantity=quantity,
            price_at_sale=price,
            total=quantity * price
        )

    @staticmethod
    def create_payment(sale, amount, method, recorded_by):
        return Payment.objects.create(
            sale=sale,
            amount=amount,
            method=method,
            recorded_by=recorded_by
        )

    @staticmethod
    def update_sale_paid_amount(sale, amount):
        sale.paid_amount += amount
        if sale.paid_amount >= sale.total_amount:
            sale.status = Sale.Status.COMPLETED
        sale.save()
        return sale

    @staticmethod
    def update_customer_debt(customer, amount_change):
        # amount_change positive adds debt, negative reduces it
        customer.current_debt += amount_change
        customer.save()
        return customer

    @staticmethod
    def get_sales_by_shop(shop_id):
        return Sale.objects.filter(shop_id=shop_id).order_by('-created_at')

    @staticmethod
    def get_customer_by_id(customer_id):
        try:
            return Customer.objects.get(id=customer_id)
        except Customer.DoesNotExist:
            return None
