from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard_summary, name='report-dashboard'),
    path('sales/', views.sales_report, name='report-sales'),
    path('inventory-valuation/', views.inventory_valuation, name='report-inventory-valuation'),
    path('stock-alerts/', views.stock_alerts, name='report-stock-alerts'),
    path('top-products/', views.top_products, name='report-top-products'),
]
