from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .services import ShopService
from .serializers import ShopSerializer, ShopMemberSerializer
from .models import Shop

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def list_create_shops(request):
    service = ShopService()
    
    if request.method == 'GET':
        shops = service.get_user_shops(request.user)
        serializer = ShopSerializer(shops, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = ShopSerializer(data=request.data)
        if serializer.is_valid():
            try:
                shop = service.create_shop(request.user, serializer.validated_data)
                return Response(ShopSerializer(shop).data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def retrieve_update_destroy_shop(request, shop_id):
    # For MVP, simple ownership check. In production, use Repository/Service for permission logic.
    shop = get_object_or_404(Shop, id=shop_id)
    
    # Check if user is a member
    if not shop.members.filter(user=request.user).exists():
        return Response({"detail": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        serializer = ShopSerializer(shop)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = ShopSerializer(shop, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Only owner can delete
        if shop.owner != request.user:
            return Response({"detail": "Only owner can delete shop"}, status=status.HTTP_403_FORBIDDEN)
        shop.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_shop_members(request, shop_id):
    shop = get_object_or_404(Shop, id=shop_id)
    if not shop.members.filter(user=request.user).exists():
        return Response({"detail": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
        
    members = shop.members.all()
    serializer = ShopMemberSerializer(members, many=True)
    return Response(serializer.data)
