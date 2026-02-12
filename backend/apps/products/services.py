from .repositories import ProductRepository, CategoryRepository, SupplierRepository
from django.core.exceptions import ValidationError

class ProductService:
    def __init__(self):
        self.repo = ProductRepository()
        self.category_repo = CategoryRepository()
        self.supplier_repo = SupplierRepository()

    def list_products(self, shop_id, query=None):
        if query:
            return self.repo.search_products(shop_id, query)
        return self.repo.get_products_by_shop(shop_id)

    def create_product(self, shop_id, data):
        # Validate barcode uniqueness (though DB constraint exists, logic check is good)
        if data.get('barcode'):
            existing = self.repo.get_by_barcode(shop_id, data['barcode'])
            if existing:
                raise ValidationError(f"Product with barcode {data['barcode']} already exists.")

        # Ensure relationships belong to same shop
        if data.get('category') and data['category'].shop_id != shop_id:
            raise ValidationError("Category belongs to a different shop")
        
        return self.repo.create_product(shop_id=shop_id, **data)

    def update_product(self, product, data):
        return self.repo.update_product(product, **data)

    def delete_product(self, product):
        # Soft delete
        self.repo.soft_delete_product(product)

    # Category methods
    def list_categories(self, shop_id):
        return self.category_repo.get_by_shop(shop_id)

    def create_category(self, shop_id, data):
        return self.category_repo.create_category(shop_id=shop_id, **data)

    # Supplier methods
    def list_suppliers(self, shop_id):
        return self.supplier_repo.get_by_shop(shop_id)

    def create_supplier(self, shop_id, data):
        return self.supplier_repo.create_supplier(shop_id=shop_id, **data)
