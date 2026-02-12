import { useState, useCallback, useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import { YStack, XStack, Text, H2, H3 } from 'tamagui';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    CreditCard,
    Banknote,
    Building,
    Users,
    Check,
    Search,
    Package
} from '@tamagui/lucide-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { Button, Card } from '../../components/ui';
import { usePOSStore, CartItem } from '../../stores/posStore';
import { useProductsStore, Product } from '../../stores/productsStore';
import { useShopStore } from '../../stores/shopStore';

type View = 'products' | 'cart' | 'checkout';

export default function POSScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [currentView, setCurrentView] = useState<View>('products');

    const { products, fetchProducts } = useProductsStore();
    const { activeShop } = useShopStore();
    const {
        cart,
        paymentMethod,
        isProcessing,
        error,
        getTotal,
        getItemCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        setPaymentMethod,
        processSale,
    } = usePOSStore();

    useEffect(() => {
        if (activeShop) {
            fetchProducts();
        }
    }, [activeShop]);

    const formatCurrency = (amount: number | undefined | null) => {
        const value = typeof amount === 'number' ? amount : 0;
        return `R ${value.toFixed(2)}`;
    };

    const handleProductPress = (product: Product) => {
        if (product.current_stock <= 0) {
            Alert.alert('Out of Stock', 'This product is currently out of stock.');
            return;
        }
        addToCart(product);
    };

    const handleCheckout = async () => {
        const total = getTotal();
        const amountPaid = paymentMethod === 'CREDIT' ? 0 : total;

        const success = await processSale(amountPaid);
        if (success) {
            Alert.alert('Success', 'Sale completed successfully!', [
                { text: 'OK', onPress: () => setCurrentView('products') }
            ]);
        } else if (error) {
            Alert.alert('Error', error);
        }
    };

    const renderProduct = ({ item }: { item: Product }) => {
        const isOutOfStock = item.current_stock <= 0;
        const cartItem = cart.find((c) => c.product.id === item.id);

        return (
            <Pressable
                onPress={() => handleProductPress(item)}
                disabled={isOutOfStock}
                style={({ pressed }) => [
                    styles.productItem,
                    pressed && !isOutOfStock && styles.productItemPressed,
                    isOutOfStock && styles.productItemDisabled
                ]}
            >
                <Card padding="$3">
                    <YStack gap="$2">
                        <XStack justifyContent="space-between" alignItems="center">
                            <Text fontSize="$4" fontWeight="600" color={isOutOfStock ? '$muted' : '$color'} numberOfLines={1} flex={1}>
                                {item.name}
                            </Text>
                            {cartItem && (
                                <XStack backgroundColor="$primary" paddingHorizontal="$2" paddingVertical="$1" borderRadius="$2">
                                    <Text fontSize="$2" fontWeight="bold" color="white">
                                        {cartItem.quantity}
                                    </Text>
                                </XStack>
                            )}
                        </XStack>
                        <XStack justifyContent="space-between" alignItems="center">
                            <Text fontSize="$4" fontWeight="bold" color={isOutOfStock ? '$muted' : '$primary'}>
                                {formatCurrency(item.unit_price)}
                            </Text>
                            <Text fontSize="$2" color={isOutOfStock ? '$danger' : '$muted'}>
                                {isOutOfStock ? 'Out of stock' : `${item.current_stock} left`}
                            </Text>
                        </XStack>
                    </YStack>
                </Card>
            </Pressable>
        );
    };

    const renderCartItem = ({ item }: { item: CartItem }) => (
        <Animated.View entering={FadeInDown.springify()}>
            <Card padding="$3" marginBottom="$2">
                <XStack alignItems="center" gap="$3">
                    <YStack flex={1}>
                        <Text fontSize="$4" fontWeight="600" color="$color" numberOfLines={1}>
                            {item.product.name}
                        </Text>
                        <Text fontSize="$3" color="$primary">
                            {formatCurrency(item.price)} each
                        </Text>
                    </YStack>

                    <XStack alignItems="center" gap="$2">
                        <Pressable onPress={() => updateQuantity(item.product.id, item.quantity - 1)}>
                            <XStack backgroundColor="$backgroundHover" padding="$2" borderRadius="$2">
                                <Minus size={18} color="$color" />
                            </XStack>
                        </Pressable>
                        <Text fontSize="$4" fontWeight="bold" minWidth={30} textAlign="center">
                            {item.quantity}
                        </Text>
                        <Pressable onPress={() => updateQuantity(item.product.id, item.quantity + 1)}>
                            <XStack backgroundColor="$primary" padding="$2" borderRadius="$2">
                                <Plus size={18} color="white" />
                            </XStack>
                        </Pressable>
                    </XStack>

                    <Text fontSize="$4" fontWeight="bold" color="$color" minWidth={70} textAlign="right">
                        {formatCurrency(item.price * item.quantity)}
                    </Text>

                    <Pressable onPress={() => removeFromCart(item.product.id)}>
                        <Trash2 size={20} color="$danger" />
                    </Pressable>
                </XStack>
            </Card>
        </Animated.View>
    );

    const PaymentMethodButton = ({ method, label, icon: Icon }: { method: typeof paymentMethod; label: string; icon: any }) => (
        <Pressable
            onPress={() => setPaymentMethod(method)}
            style={styles.paymentButton}
        >
            <Card
                backgroundColor={paymentMethod === method ? '$primary' : '$card'}
                borderColor={paymentMethod === method ? '$primary' : '$border'}
                borderWidth={2}
                padding="$3"
            >
                <YStack alignItems="center" gap="$2">
                    <Icon size={24} color={paymentMethod === method ? 'white' : '$color'} />
                    <Text fontSize="$3" fontWeight="600" color={paymentMethod === method ? 'white' : '$color'}>
                        {label}
                    </Text>
                </YStack>
            </Card>
        </Pressable>
    );

    // Products View
    if (currentView === 'products') {
        return (
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <YStack flex={1} backgroundColor="$background">
                    <Animated.View entering={FadeInDown.delay(50).springify()}>
                        <XStack paddingHorizontal="$5" paddingVertical="$4" justifyContent="space-between" alignItems="center">
                            <H2 color="$color">POS</H2>
                            <Pressable onPress={() => setCurrentView('cart')}>
                                <XStack
                                    backgroundColor="$primary"
                                    paddingHorizontal="$4"
                                    paddingVertical="$2"
                                    borderRadius="$3"
                                    alignItems="center"
                                    gap="$2"
                                >
                                    <ShoppingCart size={20} color="white" />
                                    <Text color="white" fontWeight="bold">
                                        {getItemCount()} - {formatCurrency(getTotal())}
                                    </Text>
                                </XStack>
                            </Pressable>
                        </XStack>
                    </Animated.View>

                    <FlatList
                        key="pos-products-grid"
                        data={products}
                        keyExtractor={(item) => item.id}
                        renderItem={renderProduct}
                        numColumns={2}
                        columnWrapperStyle={styles.productRow}
                        contentContainerStyle={[styles.productList, { paddingBottom: 20 + insets.bottom }]}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <YStack flex={1} alignItems="center" justifyContent="center" padding="$10">
                                <Package size={48} color="$muted" />
                                <Text color="$muted" marginTop="$4">No products available</Text>
                            </YStack>
                        }
                    />
                </YStack>
            </SafeAreaView>
        );
    }

    // Cart View
    if (currentView === 'cart') {
        return (
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <YStack flex={1} backgroundColor="$background">
                    <Animated.View entering={FadeInUp.springify()}>
                        <XStack paddingHorizontal="$5" paddingVertical="$4" justifyContent="space-between" alignItems="center">
                            <Pressable onPress={() => setCurrentView('products')}>
                                <Text color="$primary" fontSize="$4">← Back</Text>
                            </Pressable>
                            <H3 color="$color">Cart ({getItemCount()})</H3>
                            <Pressable onPress={clearCart}>
                                <Text color="$danger" fontSize="$4">Clear</Text>
                            </Pressable>
                        </XStack>
                    </Animated.View>

                    <FlatList
                        data={cart}
                        keyExtractor={(item) => item.product.id}
                        renderItem={renderCartItem}
                        contentContainerStyle={{ paddingHorizontal: 20 }}
                        ListEmptyComponent={
                            <YStack alignItems="center" padding="$10">
                                <ShoppingCart size={48} color="$muted" />
                                <Text color="$muted" marginTop="$4">Cart is empty</Text>
                            </YStack>
                        }
                    />

                    {/* Total & Checkout */}
                    <YStack
                        padding="$5"
                        backgroundColor="$card"
                        borderTopWidth={1}
                        borderTopColor="$border"
                        paddingBottom={20 + insets.bottom}
                    >
                        <XStack justifyContent="space-between" marginBottom="$4">
                            <Text fontSize="$5" color="$muted">Total</Text>
                            <Text fontSize="$6" fontWeight="bold" color="$color">{formatCurrency(getTotal())}</Text>
                        </XStack>
                        <Button
                            variant="primary"
                            size="large"
                            fullWidth
                            disabled={cart.length === 0}
                            onPress={() => setCurrentView('checkout')}
                        >
                            <Text color="white" fontWeight="bold">Proceed to Checkout</Text>
                        </Button>
                    </YStack>
                </YStack>
            </SafeAreaView>
        );
    }

    // Checkout View
    return (
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
            <YStack flex={1} backgroundColor="$background">
                <Animated.View entering={FadeInUp.springify()}>
                    <XStack paddingHorizontal="$5" paddingVertical="$4" alignItems="center">
                        <Pressable onPress={() => setCurrentView('cart')}>
                            <Text color="$primary" fontSize="$4">← Back</Text>
                        </Pressable>
                        <H3 color="$color" flex={1} textAlign="center">Checkout</H3>
                        <YStack width={50} />
                    </XStack>
                </Animated.View>

                <YStack flex={1} padding="$5" gap="$6">
                    {/* Payment Method */}
                    <YStack gap="$3">
                        <Text fontSize="$4" fontWeight="600" color="$color">Payment Method</Text>
                        <XStack gap="$3">
                            <PaymentMethodButton method="CASH" label="Cash" icon={Banknote} />
                            <PaymentMethodButton method="CARD" label="Card" icon={CreditCard} />
                            <PaymentMethodButton method="EFT" label="EFT" icon={Building} />
                            <PaymentMethodButton method="CREDIT" label="Credit" icon={Users} />
                        </XStack>
                    </YStack>

                    {paymentMethod === 'CREDIT' && (
                        <Animated.View entering={FadeInDown.springify()}>
                            <Card backgroundColor="rgba(245, 158, 11, 0.1)" padding="$4">
                                <Text color="$warning" fontSize="$3">
                                    ⚠️ Credit sales require customer selection. Feature coming soon.
                                </Text>
                            </Card>
                        </Animated.View>
                    )}

                    {/* Order Summary */}
                    <YStack gap="$3">
                        <Text fontSize="$4" fontWeight="600" color="$color">Order Summary</Text>
                        <Card padding="$4">
                            <YStack gap="$2">
                                <XStack justifyContent="space-between">
                                    <Text color="$muted">Items</Text>
                                    <Text color="$color">{getItemCount()}</Text>
                                </XStack>
                                <XStack justifyContent="space-between">
                                    <Text color="$muted">Subtotal</Text>
                                    <Text color="$color">{formatCurrency(getTotal())}</Text>
                                </XStack>
                                <XStack height={1} backgroundColor="$border" marginVertical="$2" />
                                <XStack justifyContent="space-between">
                                    <Text fontSize="$5" fontWeight="bold" color="$color">Total</Text>
                                    <Text fontSize="$5" fontWeight="bold" color="$primary">{formatCurrency(getTotal())}</Text>
                                </XStack>
                            </YStack>
                        </Card>
                    </YStack>
                </YStack>

                {/* Complete Sale Button */}
                <YStack
                    padding="$5"
                    backgroundColor="$card"
                    borderTopWidth={1}
                    borderTopColor="$border"
                    paddingBottom={20 + insets.bottom}
                >
                    <Button
                        variant="success"
                        size="large"
                        fullWidth
                        disabled={isProcessing || (paymentMethod === 'CREDIT')}
                        onPress={handleCheckout}
                    >
                        <Check size={20} color="white" />
                        <Text color="white" fontWeight="bold">
                            {isProcessing ? 'Processing...' : `Complete Sale - ${formatCurrency(getTotal())}`}
                        </Text>
                    </Button>
                </YStack>
            </YStack>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    productList: {
        paddingHorizontal: 16,
    },
    productRow: {
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    productItem: {
        width: '48%',
    },
    productItemPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    productItemDisabled: {
        opacity: 0.5,
    },
    paymentButton: {
        flex: 1,
    },
});
