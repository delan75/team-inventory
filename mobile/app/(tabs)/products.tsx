import { useEffect, useCallback, useState } from 'react';
import { FlatList, RefreshControl, Pressable, StyleSheet, TextInput } from 'react-native';
import { YStack, XStack, Text, H2 } from 'tamagui';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    Search,
    Plus,
    Package,
    AlertTriangle,
} from '@tamagui/lucide-icons';
import Animated, {
    FadeInDown,
    FadeInRight,
} from 'react-native-reanimated';

import { Card } from '../../components/ui';
import { useProductsStore, Product } from '../../stores/productsStore';
import { useShopStore } from '../../stores/shopStore';

export default function ProductsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { products, isLoading, fetchProducts, searchQuery, setSearchQuery } = useProductsStore();
    const { activeShop } = useShopStore();
    const [localSearch, setLocalSearch] = useState('');

    useEffect(() => {
        if (activeShop) {
            fetchProducts();
        }
    }, [activeShop]);

    const onRefresh = useCallback(async () => {
        await fetchProducts();
    }, []);

    const handleSearch = useCallback(() => {
        setSearchQuery(localSearch);
        fetchProducts(localSearch);
    }, [localSearch]);

    const formatCurrency = (amount: number | undefined | null) => {
        const value = typeof amount === 'number' ? amount : 0;
        return `R ${value.toFixed(2)}`;
    };

    const getStockStatus = (product: Product) => {
        if (product.current_stock === 0) return 'out';
        if (product.current_stock <= product.minimum_stock) return 'low';
        return 'ok';
    };

    const renderProduct = ({ item, index }: { item: Product; index: number }) => {
        const stockStatus = getStockStatus(item);

        return (
            <Animated.View entering={FadeInRight.delay(index * 50).springify()}>
                <Pressable
                    onPress={() => router.push(`/product/${item.id}` as any)}
                    style={({ pressed }) => [
                        styles.productCard,
                        pressed && styles.productCardPressed
                    ]}
                >
                    <Card padding="$3">
                        <XStack alignItems="center" gap="$3">
                            {/* Product Image/Icon */}
                            <XStack
                                backgroundColor={stockStatus === 'out' ? '$danger' : stockStatus === 'low' ? '$warning' : '$backgroundHover'}
                                width={56}
                                height={56}
                                borderRadius="$3"
                                alignItems="center"
                                justifyContent="center"
                                opacity={stockStatus === 'out' ? 0.2 : 1}
                            >
                                {stockStatus === 'out' ? (
                                    <AlertTriangle size={24} color="$danger" />
                                ) : (
                                    <Package size={24} color={stockStatus === 'low' ? '$warning' : '$primary'} />
                                )}
                            </XStack>

                            {/* Product Info */}
                            <YStack flex={1} gap="$1">
                                <Text fontSize="$4" fontWeight="600" color="$color" numberOfLines={1}>
                                    {item.name}
                                </Text>
                                <Text fontSize="$3" color="$muted">
                                    SKU: {item.sku}
                                </Text>
                                <XStack gap="$3" marginTop="$1">
                                    <Text fontSize="$3" fontWeight="600" color="$primary">
                                        {formatCurrency(item.unit_price)}
                                    </Text>
                                    {item.category && (
                                        <Text fontSize="$2" color="$muted" backgroundColor="$backgroundHover" paddingHorizontal="$2" paddingVertical="$1" borderRadius="$2">
                                            {item.category.name}
                                        </Text>
                                    )}
                                </XStack>
                            </YStack>

                            {/* Stock Badge */}
                            <YStack alignItems="flex-end" gap="$1">
                                <XStack
                                    backgroundColor={
                                        stockStatus === 'out' ? 'rgba(239, 68, 68, 0.1)' :
                                            stockStatus === 'low' ? 'rgba(245, 158, 11, 0.1)' :
                                                'rgba(16, 185, 129, 0.1)'
                                    }
                                    paddingHorizontal="$2"
                                    paddingVertical="$1"
                                    borderRadius="$2"
                                >
                                    <Text
                                        fontSize="$2"
                                        fontWeight="600"
                                        color={
                                            stockStatus === 'out' ? '$danger' :
                                                stockStatus === 'low' ? '$warning' :
                                                    '$success'
                                        }
                                    >
                                        {item.current_stock} in stock
                                    </Text>
                                </XStack>
                                {stockStatus !== 'ok' && (
                                    <Text fontSize="$1" color="$muted">
                                        Min: {item.minimum_stock}
                                    </Text>
                                )}
                            </YStack>
                        </XStack>
                    </Card>
                </Pressable>
            </Animated.View>
        );
    };

    const ListEmptyComponent = () => (
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$10" gap="$4">
            <Package size={64} color="$muted" />
            <Text color="$muted" textAlign="center">
                {searchQuery ? 'No products found' : 'No products yet'}
            </Text>
            <Text color="$muted" fontSize="$3" textAlign="center">
                {searchQuery ? 'Try a different search term' : 'Tap + to add your first product'}
            </Text>
        </YStack>
    );

    return (
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
            <YStack flex={1} backgroundColor="$background">
                {/* Header */}
                <Animated.View entering={FadeInDown.delay(50).springify()}>
                    <YStack paddingHorizontal="$5" paddingVertical="$4" gap="$3">
                        <XStack justifyContent="space-between" alignItems="center">
                            <H2 color="$color">Products</H2>
                            <Text color="$muted" fontSize="$3">
                                {products.length} items
                            </Text>
                        </XStack>

                        {/* Search Bar */}
                        <XStack
                            backgroundColor="$backgroundHover"
                            borderRadius="$3"
                            paddingHorizontal="$3"
                            alignItems="center"
                            height={44}
                        >
                            <Search size={20} color="$muted" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search products..."
                                placeholderTextColor="#9CA3AF"
                                value={localSearch}
                                onChangeText={setLocalSearch}
                                onSubmitEditing={handleSearch}
                                returnKeyType="search"
                            />
                        </XStack>
                    </YStack>
                </Animated.View>

                {/* Product List */}
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id}
                    renderItem={renderProduct}
                    contentContainerStyle={[
                        styles.listContent,
                        { paddingBottom: 100 + insets.bottom }
                    ]}
                    ItemSeparatorComponent={() => <YStack height={12} />}
                    ListEmptyComponent={ListEmptyComponent}
                    refreshControl={
                        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
                    }
                    showsVerticalScrollIndicator={false}
                />

                {/* FAB - Add Product */}
                <Pressable
                    style={[styles.fab, { bottom: 100 + insets.bottom }]}
                    onPress={() => router.push('/product/add' as any)}
                >
                    <XStack
                        backgroundColor="$primary"
                        width={56}
                        height={56}
                        borderRadius={28}
                        alignItems="center"
                        justifyContent="center"
                        shadowColor="#000"
                        shadowOffset={{ width: 0, height: 4 }}
                        shadowOpacity={0.3}
                        shadowRadius={8}
                        elevation={8}
                    >
                        <Plus size={24} color="white" />
                    </XStack>
                </Pressable>
            </YStack>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    productCard: {
        transform: [{ scale: 1 }],
    },
    productCardPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    fab: {
        position: 'absolute',
        right: 20,
    },
    searchInput: {
        flex: 1,
        height: 44,
        paddingHorizontal: 12,
        fontSize: 16,
        color: '#1A1A1A',
    },
});
