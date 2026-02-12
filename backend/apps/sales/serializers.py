from rest_framework import serializers
from .models import Sale, SaleItem, Payment, Customer

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'name', 'phone', 'email', 'current_debt', 'created_at']
        read_only_fields = ['id', 'current_debt', 'created_at']

class SaleItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = SaleItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price_at_sale', 'total']

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'amount', 'method', 'created_at']

class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    seller_name = serializers.CharField(source='seller.get_full_name', read_only=True)
    remaining_balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Sale
        fields = [
            'id', 'customer', 'customer_name', 'seller_name', 
            'total_amount', 'paid_amount', 'change_amount', 'remaining_balance',
            'status', 'payment_method', 'created_at', 
            'items', 'payments'
        ]
        read_only_fields = ['id', 'seller', 'created_at', 'total_amount', 'change_amount', 'remaining_balance']

class CreateSaleItemSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1)
    price = serializers.DecimalField(max_digits=10, decimal_places=2)

class CreatePaymentSerializer(serializers.Serializer):
    amount_paid = serializers.DecimalField(max_digits=10, decimal_places=2)
    method = serializers.ChoiceField(choices=Sale.PaymentMethod.choices)

class CreateSaleSerializer(serializers.Serializer):
    customer_id = serializers.UUIDField(required=False, allow_null=True)
    items = CreateSaleItemSerializer(many=True)
    payment = CreatePaymentSerializer()
