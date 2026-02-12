from django.urls import path
from . import views

urlpatterns = [
    # Inventory
    path('movements/', views.list_inventory_movements, name='inventory-movements'),
    path('adjust/', views.adjust_inventory, name='inventory-adjust'),
    
    # Purchases
    path('purchases/', views.list_create_purchase_orders, name='purchase-list-create'),
    path('purchases/<uuid:order_id>/complete/', views.complete_purchase_order, name='purchase-complete'),
]
