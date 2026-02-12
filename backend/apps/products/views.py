from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .services import ProductService
from .serializers import ProductSerializer, ProductListSerializer, CategorySerializer, SupplierSerializer, ProductImageSerializer
from .models import Product, Category, Supplier, ProductImage
from apps.core.responses import (
    success_response, created_response, validation_error_response, error_response
)
from apps.core.shop_context import get_shop_context


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def list_create_products(request):
    shop, error = get_shop_context(request)
    if error:
        return error

    service = ProductService()
    
    if request.method == 'GET':
        query = request.query_params.get('search')
        products = service.list_products(shop.id, query)
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return success_response(serializer.data)
    
    elif request.method == 'POST':
        serializer = ProductSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            try:
                product = service.create_product(shop.id, serializer.validated_data)
                return created_response(ProductSerializer(product, context={'request': request}).data, 'Product created successfully')
            except Exception as e:
                return error_response('CREATION_ERROR', str(e))
        return validation_error_response(serializer.errors)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def retrieve_update_destroy_product(request, product_id):
    shop, error = get_shop_context(request)
    if error:
        return error
        
    product = get_object_or_404(Product, id=product_id, shop_id=shop.id)
    service = ProductService()

    if request.method == 'GET':
        serializer = ProductSerializer(product, context={'request': request})
        return success_response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = ProductSerializer(product, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            updated_product = service.update_product(product, serializer.validated_data)
            return success_response(ProductSerializer(updated_product, context={'request': request}).data)
        return validation_error_response(serializer.errors)
    
    elif request.method == 'DELETE':
        service.delete_product(product)
        return success_response(message='Product deleted successfully')


# Product Images Views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def product_images(request, product_id):
    shop, error = get_shop_context(request)
    if error:
        return error
    
    product = get_object_or_404(Product, id=product_id, shop_id=shop.id)
    
    if request.method == 'GET':
        images = product.images.all()
        serializer = ProductImageSerializer(images, many=True, context={'request': request})
        return success_response(serializer.data)
    
    elif request.method == 'POST':
        serializer = ProductImageSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(product=product)
            return created_response(serializer.data, 'Image uploaded successfully')
        return validation_error_response(serializer.errors)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_product_image(request, product_id, image_id):
    shop, error = get_shop_context(request)
    if error:
        return error
    
    product = get_object_or_404(Product, id=product_id, shop_id=shop.id)
    image = get_object_or_404(ProductImage, id=image_id, product=product)
    image.delete()
    return success_response(message='Image deleted successfully')


# Categories Views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def list_create_categories(request):
    shop, error = get_shop_context(request)
    if error:
        return error
        
    service = ProductService()

    if request.method == 'GET':
        categories = service.list_categories(shop.id)
        return success_response(CategorySerializer(categories, many=True).data)
    
    elif request.method == 'POST':
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            category = service.create_category(shop.id, serializer.validated_data)
            return created_response(CategorySerializer(category).data)
        return validation_error_response(serializer.errors)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def update_delete_category(request, category_id):
    shop, error = get_shop_context(request)
    if error:
        return error
    
    category = get_object_or_404(Category, id=category_id, shop_id=shop.id)
    
    if request.method == 'PUT':
        serializer = CategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return success_response(serializer.data)
        return validation_error_response(serializer.errors)
    
    elif request.method == 'DELETE':
        category.delete()
        return success_response(message='Category deleted successfully')


# Suppliers Views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def list_create_suppliers(request):
    shop, error = get_shop_context(request)
    if error:
        return error
        
    service = ProductService()

    if request.method == 'GET':
        suppliers = service.list_suppliers(shop.id)
        return success_response(SupplierSerializer(suppliers, many=True).data)
    
    elif request.method == 'POST':
        serializer = SupplierSerializer(data=request.data)
        if serializer.is_valid():
            supplier = service.create_supplier(shop.id, serializer.validated_data)
            return created_response(SupplierSerializer(supplier).data)
        return validation_error_response(serializer.errors)
