from rest_framework import serializers
from .models import StockMovement, InventoryAdjustment, PurchaseOrder, PurchaseItem

class StockMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    performed_by_name = serializers.CharField(source='performed_by.get_full_name', read_only=True)

    class Meta:
        model = StockMovement
        fields = ['id', 'product', 'product_name', 'quantity', 'movement_type', 'reason', 'performed_by_name', 'created_at']
        read_only_fields = ['id', 'created_at', 'movement_type', 'quantity', 'performed_by_name']

class InventoryAdjustmentSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    new_quantity = serializers.IntegerField()
    reason = serializers.CharField(required=False, allow_blank=True)

class PurchaseItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = PurchaseItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_cost', 'total_cost']

class PurchaseOrderSerializer(serializers.ModelSerializer):
    items = PurchaseItemSerializer(many=True, read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = ['id', 'supplier', 'supplier_name', 'total_cost', 'status', 'notes', 'created_by_name', 'created_at', 'completed_at', 'items']
        read_only_fields = ['id', 'total_cost', 'status', 'created_by', 'created_at', 'completed_at']

class CreatePurchaseItemSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1)
    cost = serializers.DecimalField(max_digits=10, decimal_places=2)

class CreatePurchaseOrderSerializer(serializers.Serializer):
    supplier_id = serializers.UUIDField(required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    items = CreatePurchaseItemSerializer(many=True)
