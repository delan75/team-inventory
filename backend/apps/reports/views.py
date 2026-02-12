from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Avg, F
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from apps.core.responses import success_response, error_response
from apps.core.shop_context import get_shop_context
from apps.sales.models import Sale, SaleItem, Customer
from apps.products.models import Product, Category
from apps.inventory.models import StockMovement


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    """
    Dashboard summary with key metrics.
    GET /api/v1/reports/dashboard/
    """
    shop, error = get_shop_context(request)
    if error:
        return error
    
    today = timezone.now().date()
    week_start = today - timedelta(days=today.weekday())
    month_start = today.replace(day=1)
    
    # Sales metrics
    sales_today = Sale.objects.filter(
        shop_id=shop.id, created_at__date=today
    ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
    
    sales_this_week = Sale.objects.filter(
        shop_id=shop.id, created_at__date__gte=week_start
    ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
    
    sales_this_month = Sale.objects.filter(
        shop_id=shop.id, created_at__date__gte=month_start
    ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
    
    # Stock alerts
    low_stock_count = Product.objects.filter(
        shop_id=shop.id,
        current_stock__lte=F('minimum_stock'),
        current_stock__gt=0,
        is_active=True
    ).count()
    
    out_of_stock_count = Product.objects.filter(
        shop_id=shop.id,
        current_stock=0,
        is_active=True
    ).count()
    
    # Credit sales
    pending_credit_sales = Sale.objects.filter(
        shop_id=shop.id, status='PENDING'
    ).count()
    
    total_outstanding_debt = Customer.objects.filter(
        shop_id=shop.id
    ).aggregate(total=Sum('current_debt'))['total'] or Decimal('0.00')
    
    # Top products today
    top_products = SaleItem.objects.filter(
        sale__shop_id=shop.id,
        sale__created_at__date=today
    ).values('product__name').annotate(
        quantity_sold=Sum('quantity'),
        revenue=Sum(F('quantity') * F('price_at_sale'))
    ).order_by('-quantity_sold')[:5]
    
    return success_response({
        'sales': {
            'today': float(sales_today),
            'this_week': float(sales_this_week),
            'this_month': float(sales_this_month),
        },
        'alerts': {
            'low_stock_count': low_stock_count,
            'out_of_stock_count': out_of_stock_count,
        },
        'credit': {
            'pending_sales_count': pending_credit_sales,
            'total_outstanding_debt': float(total_outstanding_debt),
        },
        'top_products_today': list(top_products)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sales_report(request):
    """
    Sales report with date range filtering.
    GET /api/v1/reports/sales/?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
    """
    shop, error = get_shop_context(request)
    if error:
        return error
    
    # Parse date range
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    
    if not start_date or not end_date:
        # Default to last 30 days
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=30)
    
    sales = Sale.objects.filter(
        shop_id=shop.id,
        created_at__date__gte=start_date,
        created_at__date__lte=end_date
    )
    
    # Aggregate metrics
    totals = sales.aggregate(
        total_sales=Sum('total_amount'),
        total_transactions=Count('id'),
        avg_sale=Avg('total_amount')
    )
    
    # Payment breakdown
    payment_breakdown = sales.values('payment_method').annotate(
        total=Sum('total_amount')
    )
    
    # Daily breakdown
    daily_breakdown = sales.annotate(
        date=TruncDate('created_at')
    ).values('date').annotate(
        total=Sum('total_amount'),
        count=Count('id')
    ).order_by('date')
    
    return success_response({
        'period': {'start': str(start_date), 'end': str(end_date)},
        'totals': {
            'total_sales': float(totals['total_sales'] or 0),
            'total_transactions': totals['total_transactions'] or 0,
            'average_sale': float(totals['avg_sale'] or 0),
        },
        'payment_breakdown': {
            item['payment_method']: float(item['total'] or 0) 
            for item in payment_breakdown
        },
        'daily_breakdown': [
            {'date': str(item['date']), 'total': float(item['total']), 'count': item['count']}
            for item in daily_breakdown
        ]
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def inventory_valuation(request):
    """
    Inventory valuation report.
    GET /api/v1/reports/inventory-valuation/
    """
    shop, error = get_shop_context(request)
    if error:
        return error
    
    products = Product.objects.filter(shop_id=shop.id, is_active=True)
    
    # Total valuation
    total_value = products.aggregate(
        value=Sum(F('current_stock') * F('cost_price'))
    )['value'] or Decimal('0.00')
    
    total_retail = products.aggregate(
        value=Sum(F('current_stock') * F('unit_price'))
    )['value'] or Decimal('0.00')
    
    # By category
    by_category = products.values('category__name').annotate(
        stock_value=Sum(F('current_stock') * F('cost_price')),
        product_count=Count('id'),
        total_stock=Sum('current_stock')
    ).order_by('-stock_value')
    
    return success_response({
        'summary': {
            'total_cost_value': float(total_value),
            'total_retail_value': float(total_retail),
            'potential_profit': float(total_retail - total_value),
            'total_products': products.count(),
        },
        'by_category': [
            {
                'category': item['category__name'] or 'Uncategorized',
                'stock_value': float(item['stock_value'] or 0),
                'product_count': item['product_count'],
                'total_stock': item['total_stock']
            }
            for item in by_category
        ]
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stock_alerts(request):
    """
    Stock alerts - low stock and out of stock products.
    GET /api/v1/reports/stock-alerts/
    """
    shop, error = get_shop_context(request)
    if error:
        return error
    
    # Low stock (stock <= minimum but > 0)
    low_stock = Product.objects.filter(
        shop_id=shop.id,
        current_stock__lte=F('minimum_stock'),
        current_stock__gt=0,
        is_active=True
    ).values('id', 'name', 'sku', 'current_stock', 'minimum_stock', 'category__name')
    
    # Out of stock
    out_of_stock = Product.objects.filter(
        shop_id=shop.id,
        current_stock=0,
        is_active=True
    ).values('id', 'name', 'sku', 'minimum_stock', 'category__name')
    
    return success_response({
        'low_stock': [
            {
                'id': str(p['id']),
                'name': p['name'],
                'sku': p['sku'],
                'current_stock': p['current_stock'],
                'minimum_stock': p['minimum_stock'],
                'category': p['category__name']
            }
            for p in low_stock
        ],
        'out_of_stock': [
            {
                'id': str(p['id']),
                'name': p['name'],
                'sku': p['sku'],
                'minimum_stock': p['minimum_stock'],
                'category': p['category__name']
            }
            for p in out_of_stock
        ],
        'summary': {
            'low_stock_count': low_stock.count(),
            'out_of_stock_count': out_of_stock.count()
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def top_products(request):
    """
    Top selling products by quantity and revenue.
    GET /api/v1/reports/top-products/?period=week|month&limit=10
    """
    shop, error = get_shop_context(request)
    if error:
        return error
    
    period = request.query_params.get('period', 'week')
    limit = int(request.query_params.get('limit', 10))
    
    today = timezone.now().date()
    if period == 'month':
        start_date = today - timedelta(days=30)
    else:  # week
        start_date = today - timedelta(days=7)
    
    sale_items = SaleItem.objects.filter(
        sale__shop_id=shop.id,
        sale__created_at__date__gte=start_date
    )
    
    # By quantity
    by_quantity = sale_items.values(
        'product__id', 'product__name', 'product__sku'
    ).annotate(
        quantity_sold=Sum('quantity')
    ).order_by('-quantity_sold')[:limit]
    
    # By revenue
    by_revenue = sale_items.values(
        'product__id', 'product__name', 'product__sku'
    ).annotate(
        revenue=Sum(F('quantity') * F('price_at_sale'))
    ).order_by('-revenue')[:limit]
    
    return success_response({
        'period': period,
        'date_range': {'start': str(start_date), 'end': str(today)},
        'by_quantity': [
            {
                'product_id': str(p['product__id']),
                'name': p['product__name'],
                'sku': p['product__sku'],
                'quantity_sold': p['quantity_sold']
            }
            for p in by_quantity
        ],
        'by_revenue': [
            {
                'product_id': str(p['product__id']),
                'name': p['product__name'],
                'sku': p['product__sku'],
                'revenue': float(p['revenue'] or 0)
            }
            for p in by_revenue
        ]
    })
