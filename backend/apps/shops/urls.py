from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_create_shops, name='shop-list-create'),
    path('<uuid:shop_id>/', views.retrieve_update_destroy_shop, name='shop-detail'),
    path('<uuid:shop_id>/members/', views.list_shop_members, name='shop-members'),
]
