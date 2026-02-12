from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .services import SalesService
from .repositories import SalesRepository
from .serializers import SaleSerializer, CreateSaleSerializer, CustomerSerializer, PaymentSerializer
from .models import Sale, Customer
from apps.core.responses import (
    success_response, created_response, validation_error_response, error_response
)
from apps.core.shop_context import get_shop_context


# Customer Views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def list_create_customers(request):
    shop, error = get_shop_context(request)
    if error:
        return error

    if request.method == 'GET':
        customers = Customer.objects.filter(shop_id=shop.id)
        return success_response(CustomerSerializer(customers, many=True).data)
    
    elif request.method == 'POST':
        serializer = CustomerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(shop_id=shop.id)
            return created_response(serializer.data, 'Customer created successfully')
        return validation_error_response(serializer.errors)


# Sales Views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def list_create_sales(request):
    shop, error = get_shop_context(request)
    if error:
        return error
    
    if request.method == 'GET':
        repo = SalesRepository()
        sales = repo.get_sales_by_shop(shop.id)
        return success_response(SaleSerializer(sales, many=True).data)

    elif request.method == 'POST':
        # POS Transaction
        serializer = CreateSaleSerializer(data=request.data)
        if serializer.is_valid():
            service = SalesService()
            try:
                sale = service.process_sale(
                    user=request.user,
                    shop_id=shop.id,
                    items_data=serializer.validated_data['items'],
                    payment_data=serializer.validated_data['payment'],
                    customer_id=serializer.validated_data.get('customer_id')
                )
                return created_response(SaleSerializer(sale).data, 'Sale recorded successfully')
            except Exception as e:
                return error_response('SALE_ERROR', str(e))
        return validation_error_response(serializer.errors)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_payment_to_sale(request, sale_id):
    # Pay off debt
    amount = request.data.get('amount')
    method = request.data.get('method', 'CASH')
    
    if not amount:
        return error_response('VALIDATION_ERROR', 'Amount is required')
        
    service = SalesService()
    try:
        sale = service.add_payment(request.user, sale_id, amount, method)
        return success_response(SaleSerializer(sale).data, 'Payment recorded successfully')
    except Exception as e:
        return error_response('PAYMENT_ERROR', str(e))
