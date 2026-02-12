import { useState, useEffect } from 'react';
import { StyleSheet, Alert, Pressable, TextInput, ScrollView as RNScrollView, ActivityIndicator } from 'react-native';
import { YStack, XStack, Text, H2 } from 'tamagui';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
    ArrowLeft,
    Edit3,
    Trash2,
    Package,
    Save,
    X,
} from '@tamagui/lucide-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Button, Card } from '../../components/ui';
import { useProductsStore, Product } from '../../stores/productsStore';

export default function ProductDetailScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { currentProduct, fetchProduct, updateProduct, deleteProduct, isLoading } = useProductsStore();

    const [isEditing, setIsEditing] = useState(false);
    const [product, setProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        barcode: '',
        description: '',
        unit_price: '',
        cost_price: '',
        current_stock: '',
        minimum_stock: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (id) {
            fetchProduct(id);
        }
    }, [id]);

    useEffect(() => {
        if (currentProduct && currentProduct.id === id) {
            setProduct(currentProduct);
            setFormData({
                name: currentProduct.name || '',
                sku: currentProduct.sku || '',
                barcode: currentProduct.barcode || '',
                description: currentProduct.description || '',
                unit_price: (currentProduct.unit_price ?? 0).toString(),
                cost_price: (currentProduct.cost_price ?? 0).toString(),
                current_stock: (currentProduct.current_stock ?? 0).toString(),
                minimum_stock: (currentProduct.minimum_stock ?? 0).toString(),
            });
        }
    }, [currentProduct, id]);

    const updateField = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = 'Required';
        if (!formData.sku.trim()) newErrors.sku = 'Required';
        if (!formData.unit_price || parseFloat(formData.unit_price) <= 0) {
            newErrors.unit_price = 'Invalid';
        }
        if (!formData.cost_price || parseFloat(formData.cost_price) <= 0) {
            newErrors.cost_price = 'Invalid';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate() || !id) return;

        const success = await updateProduct(id, {
            name: formData.name,
            sku: formData.sku,
            barcode: formData.barcode || undefined,
            description: formData.description || undefined,
            unit_price: parseFloat(formData.unit_price),
            cost_price: parseFloat(formData.cost_price),
            current_stock: parseInt(formData.current_stock),
            minimum_stock: parseInt(formData.minimum_stock),
        });

        if (success) {
            setIsEditing(false);
            Alert.alert('Success', 'Product updated successfully');
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Product',
            `Are you sure you want to delete "${product?.name}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        if (id) {
                            const success = await deleteProduct(id);
                            if (success) {
                                router.back();
                            }
                        }
                    },
                },
            ]
        );
    };

    const formatCurrency = (amount: number | undefined | null) => {
        const value = typeof amount === 'number' ? amount : 0;
        return `R ${value.toFixed(2)}`;
    };

    const getStockStatus = () => {
        if (!product) return 'ok';
        if (product.current_stock === 0) return 'out';
        if (product.current_stock <= product.minimum_stock) return 'low';
        return 'ok';
    };

    if (!product) {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <YStack flex={1} justifyContent="center" alignItems="center">
                    <ActivityIndicator size="large" color="#6366F1" />
                </YStack>
            </SafeAreaView>
        );
    }

    const stockStatus = getStockStatus();

    return (
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
            <YStack flex={1} backgroundColor="$background">
                {/* Header */}
                <Animated.View entering={FadeInDown.springify()}>
                    <XStack paddingHorizontal="$5" paddingVertical="$4" alignItems="center" justifyContent="space-between">
                        <XStack alignItems="center" gap="$3">
                            <Pressable onPress={() => router.back()}>
                                <ArrowLeft size={24} color="$color" />
                            </Pressable>
                            <H2 color="$color" numberOfLines={1} maxWidth={200}>
                                {isEditing ? 'Edit Product' : product.name}
                            </H2>
                        </XStack>

                        <XStack gap="$2">
                            {isEditing ? (
                                <>
                                    <Pressable onPress={() => setIsEditing(false)}>
                                        <XStack backgroundColor="$backgroundHover" padding="$2" borderRadius="$2">
                                            <X size={20} color="$color" />
                                        </XStack>
                                    </Pressable>
                                    <Pressable onPress={handleSave}>
                                        <XStack backgroundColor="$primary" padding="$2" borderRadius="$2">
                                            <Save size={20} color="white" />
                                        </XStack>
                                    </Pressable>
                                </>
                            ) : (
                                <>
                                    <Pressable onPress={() => setIsEditing(true)}>
                                        <XStack backgroundColor="$backgroundHover" padding="$2" borderRadius="$2">
                                            <Edit3 size={20} color="$primary" />
                                        </XStack>
                                    </Pressable>
                                    <Pressable onPress={handleDelete}>
                                        <XStack backgroundColor="rgba(239, 68, 68, 0.1)" padding="$2" borderRadius="$2">
                                            <Trash2 size={20} color="$danger" />
                                        </XStack>
                                    </Pressable>
                                </>
                            )}
                        </XStack>
                    </XStack>
                </Animated.View>

                <RNScrollView
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 + insets.bottom }}
                    showsVerticalScrollIndicator={false}
                >
                    {isEditing ? (
                        /* Edit Form */
                        <YStack gap="$4">
                            <FormField label="Name *" value={formData.name} onChangeText={(v) => updateField('name', v)} error={errors.name} />

                            <XStack gap="$3">
                                <YStack flex={1}>
                                    <FormField label="SKU *" value={formData.sku} onChangeText={(v) => updateField('sku', v)} error={errors.sku} autoCapitalize="characters" />
                                </YStack>
                                <YStack flex={1}>
                                    <FormField label="Barcode" value={formData.barcode} onChangeText={(v) => updateField('barcode', v)} />
                                </YStack>
                            </XStack>

                            <XStack gap="$3">
                                <YStack flex={1}>
                                    <FormField label="Price *" value={formData.unit_price} onChangeText={(v) => updateField('unit_price', v)} error={errors.unit_price} keyboardType="decimal-pad" />
                                </YStack>
                                <YStack flex={1}>
                                    <FormField label="Cost *" value={formData.cost_price} onChangeText={(v) => updateField('cost_price', v)} error={errors.cost_price} keyboardType="decimal-pad" />
                                </YStack>
                            </XStack>

                            <XStack gap="$3">
                                <YStack flex={1}>
                                    <FormField label="Stock" value={formData.current_stock} onChangeText={(v) => updateField('current_stock', v)} keyboardType="number-pad" />
                                </YStack>
                                <YStack flex={1}>
                                    <FormField label="Min Stock" value={formData.minimum_stock} onChangeText={(v) => updateField('minimum_stock', v)} keyboardType="number-pad" />
                                </YStack>
                            </XStack>

                            <FormField label="Description" value={formData.description} onChangeText={(v) => updateField('description', v)} multiline />
                        </YStack>
                    ) : (
                        /* View Mode */
                        <YStack gap="$4">
                            {/* Product Icon & Status */}
                            <Animated.View entering={FadeInDown.delay(100).springify()}>
                                <Card padding="$5">
                                    <YStack alignItems="center" gap="$3">
                                        <XStack
                                            backgroundColor={
                                                stockStatus === 'out' ? 'rgba(239, 68, 68, 0.1)' :
                                                    stockStatus === 'low' ? 'rgba(245, 158, 11, 0.1)' :
                                                        '$backgroundHover'
                                            }
                                            padding="$4"
                                            borderRadius="$4"
                                        >
                                            <Package size={48} color={
                                                stockStatus === 'out' ? '$danger' :
                                                    stockStatus === 'low' ? '$warning' :
                                                        '$primary'
                                            } />
                                        </XStack>
                                        <Text fontSize="$6" fontWeight="bold" color="$color">{product.name}</Text>
                                        <XStack
                                            backgroundColor={
                                                stockStatus === 'out' ? 'rgba(239, 68, 68, 0.1)' :
                                                    stockStatus === 'low' ? 'rgba(245, 158, 11, 0.1)' :
                                                        'rgba(16, 185, 129, 0.1)'
                                            }
                                            paddingHorizontal="$3"
                                            paddingVertical="$1"
                                            borderRadius="$2"
                                        >
                                            <Text
                                                fontWeight="600"
                                                color={
                                                    stockStatus === 'out' ? '$danger' :
                                                        stockStatus === 'low' ? '$warning' :
                                                            '$success'
                                                }
                                            >
                                                {stockStatus === 'out' ? 'Out of Stock' :
                                                    stockStatus === 'low' ? 'Low Stock' :
                                                        'In Stock'}
                                            </Text>
                                        </XStack>
                                    </YStack>
                                </Card>
                            </Animated.View>

                            {/* Details */}
                            <Animated.View entering={FadeInDown.delay(150).springify()}>
                                <Card padding="$4">
                                    <YStack gap="$3">
                                        <DetailRow label="SKU" value={product.sku} />
                                        {product.barcode && <DetailRow label="Barcode" value={product.barcode} />}
                                        <DetailRow label="Selling Price" value={formatCurrency(product.unit_price)} highlight />
                                        <DetailRow label="Cost Price" value={formatCurrency(product.cost_price)} />
                                        <DetailRow label="Profit Margin" value={formatCurrency(product.unit_price - product.cost_price)} />
                                    </YStack>
                                </Card>
                            </Animated.View>

                            {/* Stock Info */}
                            <Animated.View entering={FadeInDown.delay(200).springify()}>
                                <Card padding="$4">
                                    <YStack gap="$3">
                                        <DetailRow label="Current Stock" value={product.current_stock.toString()} />
                                        <DetailRow label="Minimum Stock" value={product.minimum_stock.toString()} />
                                        <DetailRow label="Stock Value" value={formatCurrency(product.current_stock * product.cost_price)} />
                                    </YStack>
                                </Card>
                            </Animated.View>

                            {product.description && (
                                <Animated.View entering={FadeInDown.delay(250).springify()}>
                                    <Card padding="$4">
                                        <YStack gap="$2">
                                            <Text fontSize="$3" color="$muted">Description</Text>
                                            <Text color="$color">{product.description}</Text>
                                        </YStack>
                                    </Card>
                                </Animated.View>
                            )}
                        </YStack>
                    )}
                </RNScrollView>
            </YStack>
        </SafeAreaView>
    );
}

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
    return (
        <XStack justifyContent="space-between" alignItems="center">
            <Text color="$muted">{label}</Text>
            <Text fontWeight={highlight ? 'bold' : '500'} fontSize={highlight ? '$5' : '$4'} color={highlight ? '$primary' : '$color'}>
                {value}
            </Text>
        </XStack>
    );
}

function FormField({
    label,
    value,
    onChangeText,
    error,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    multiline = false,
}: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    error?: string;
    keyboardType?: 'default' | 'decimal-pad' | 'number-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    multiline?: boolean;
}) {
    return (
        <YStack gap="$1">
            <Text fontSize="$2" color="$muted">{label}</Text>
            <XStack
                backgroundColor="$background"
                borderRadius="$3"
                borderWidth={error ? 2 : 1}
                borderColor={error ? '$danger' : '$border'}
                padding="$3"
                minHeight={multiline ? 80 : 44}
            >
                <TextInput
                    style={{ flex: 1, fontSize: 16, color: '#1A1A1A', textAlignVertical: multiline ? 'top' : 'center' }}
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    multiline={multiline}
                />
            </XStack>
            {error && <Text fontSize="$1" color="$danger">{error}</Text>}
        </YStack>
    );
}
