from django.db.models import Q
from .models import Product, Category, Supplier

class ProductRepository:
    @staticmethod
    def get_products_by_shop(shop_id, include_deleted=False):
        qs = Product.objects.filter(shop_id=shop_id)
        if not include_deleted:
            qs = qs.filter(is_deleted=False)
        return qs.select_related('category', 'supplier')

    @staticmethod
    def get_product_by_id(product_id, shop_id=None):
        try:
            qs = Product.objects.all()
            if shop_id:
                qs = qs.filter(shop_id=shop_id)
            return qs.get(id=product_id)
        except Product.DoesNotExist:
            return None

    @staticmethod
    def search_products(shop_id, query):
        return Product.objects.filter(
            shop_id=shop_id,
            is_deleted=False
        ).filter(
            Q(name__icontains=query) | 
            Q(sku__icontains=query) | 
            Q(barcode__icontains=query) | 
            Q(manual_code__icontains=query)
        )

    @staticmethod
    def get_by_barcode(shop_id, code):
        return Product.objects.filter(
            shop_id=shop_id,
            is_deleted=False
        ).filter(
            Q(barcode=code) | Q(manual_code=code)
        ).first()

    @staticmethod
    def create_product(**kwargs):
        return Product.objects.create(**kwargs)

    @staticmethod
    def update_product(product, **kwargs):
        for key, value in kwargs.items():
            setattr(product, key, value)
        product.save()
        return product

    @staticmethod
    def soft_delete_product(product):
        from django.utils import timezone
        product.is_deleted = True
        product.deleted_at = timezone.now()
        product.save()

class CategoryRepository:
    @staticmethod
    def get_by_shop(shop_id):
        return Category.objects.filter(shop_id=shop_id)

    @staticmethod
    def create_category(**kwargs):
        return Category.objects.create(**kwargs)

class SupplierRepository:
    @staticmethod
    def get_by_shop(shop_id):
        return Supplier.objects.filter(shop_id=shop_id)

    @staticmethod
    def create_supplier(**kwargs):
        return Supplier.objects.create(**kwargs)
