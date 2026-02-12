from django.urls import path
from . import views

urlpatterns = [
    # Customers
    path('customers/', views.list_create_customers, name='customer-list-create'),
    
    # Sales
    path('', views.list_create_sales, name='sale-list-create'),
    path('<uuid:sale_id>/pay/', views.add_payment_to_sale, name='sale-add-payment'),
]
