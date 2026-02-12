from django.db import models
from django.conf import settings
from apps.shops.models import Shop
import uuid

class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='subcategories')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Categories"
        unique_together = ('shop', 'name')

    def __str__(self):
        return self.name

class Supplier(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='suppliers')
    name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Product(models.Model):
    class BarcodeType(models.TextChoices):
        EAN13 = 'EAN13', 'EAN-13'
        UPC = 'UPC', 'UPC-A'
        CODE128 = 'CODE128', 'Code-128'
        QR = 'QR', 'QR Code'
        MANUAL = 'MANUAL', 'Manual Code'
        NONE = 'NONE', 'No Barcode'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100)
    
    # Barcode fields
    barcode = models.CharField(max_length=100, blank=True, null=True)
    manual_code = models.CharField(max_length=100, blank=True, null=True)
    barcode_type = models.CharField(max_length=20, choices=BarcodeType.choices, default=BarcodeType.NONE)
    
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    
    # Pricing & Stock
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    
    current_stock = models.IntegerField(default=0)
    minimum_stock = models.IntegerField(default=5)
    unit = models.CharField(max_length=20, default='pcs')
    
    # Image
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('shop', 'sku')
        # Ensure barcode uniqueness within a shop if provided
        constraints = [
            models.UniqueConstraint(
                fields=['shop', 'barcode'], 
                name='unique_shop_barcode',
                condition=models.Q(barcode__isnull=False)
            ),
            models.UniqueConstraint(
                fields=['shop', 'manual_code'], 
                name='unique_shop_manual_code',
                condition=models.Q(manual_code__isnull=False)
            )
        ]

    def __str__(self):
        return self.name


class ProductImage(models.Model):
    """Additional images for a product."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')
    is_primary = models.BooleanField(default=False)
    alt_text = models.CharField(max_length=255, blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return f"{self.product.name} - Image {self.order}"
    
    def save(self, *args, **kwargs):
        # If this is marked as primary, unmark others
        if self.is_primary:
            ProductImage.objects.filter(product=self.product, is_primary=True).update(is_primary=False)
        super().save(*args, **kwargs)

