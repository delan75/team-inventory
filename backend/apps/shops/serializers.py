from rest_framework import serializers
from .models import Shop, ShopMember

class ShopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shop
        fields = ['id', 'name', 'address', 'phone', 'currency', 'created_at']
        read_only_fields = ['id', 'created_at']

class ShopMemberSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = ShopMember
        fields = ['id', 'user_email', 'user_name', 'role', 'joined_at']
        read_only_fields = ['id', 'joined_at']
