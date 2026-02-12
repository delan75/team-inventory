from django.urls import path
from . import views

urlpatterns = [
    # Products
    path('', views.list_create_products, name='product-list-create'),
    path('<uuid:product_id>/', views.retrieve_update_destroy_product, name='product-detail'),
    
    # Product Images
    path('<uuid:product_id>/images/', views.product_images, name='product-images'),
    path('<uuid:product_id>/images/<uuid:image_id>/', views.delete_product_image, name='product-image-delete'),
    
    # Categories
    path('categories/', views.list_create_categories, name='category-list-create'),
    path('categories/<uuid:category_id>/', views.update_delete_category, name='category-detail'),
    
    # Suppliers
    path('suppliers/', views.list_create_suppliers, name='supplier-list-create'),
]
