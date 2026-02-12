import { useState } from 'react';
import { StyleSheet, Alert, Modal, Pressable, TextInput, Switch, ActivityIndicator } from 'react-native';
import { YStack, XStack, Text, H2, ScrollView } from 'tamagui';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
    ArrowLeft,
    Camera,
    X,
    Package,
} from '@tamagui/lucide-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Button, Card } from '../../components/ui';
import { useProductsStore } from '../../stores/productsStore';

interface ProductFormData {
    name: string;
    sku: string;
    barcode: string;
    description: string;
    unit_price: string;
    cost_price: string;
    tax_rate: string;
    current_stock: string;
    minimum_stock: string;
    unit: string;
    is_active: boolean;
}

export default function AddProductScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { createProduct, isLoading } = useProductsStore();

    const [permission, requestPermission] = useCameraPermissions();
    const [showScanner, setShowScanner] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        sku: '',
        barcode: '',
        description: '',
        unit_price: '',
        cost_price: '',
        tax_rate: '15',
        current_stock: '0',
        minimum_stock: '5',
        unit: 'pcs',
        is_active: true,
    });
    const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});

    const updateField = (field: keyof ProductFormData, value: string | boolean) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: undefined });
        }
    };

    const handleBarCodeScanned = ({ data }: { type: string; data: string }) => {
        if (scanned) return;
        setScanned(true);
        setShowScanner(false);
        // Auto-generate SKU from barcode if empty
        if (!formData.sku) {
            setFormData(prev => ({ ...prev, barcode: data, sku: data.slice(-8).toUpperCase() }));
        } else {
            setFormData(prev => ({ ...prev, barcode: data }));
        }
        setTimeout(() => setScanned(false), 1000);
    };

    const openScanner = async () => {
        if (!permission?.granted) {
            const result = await requestPermission();
            if (!result.granted) {
                Alert.alert('Permission Denied', 'Camera permission is required to scan barcodes');
                return;
            }
        }
        setShowScanner(true);
        setScanned(false);
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof ProductFormData, string>> = {};

        if (!formData.name.trim()) newErrors.name = 'Product name is required';
        if (!formData.sku.trim()) newErrors.sku = 'SKU is required';

        const unitPrice = parseFloat(formData.unit_price);
        if (isNaN(unitPrice) || unitPrice < 0) {
            newErrors.unit_price = 'Valid selling price required';
        }

        const costPrice = parseFloat(formData.cost_price);
        if (isNaN(costPrice) || costPrice < 0) {
            newErrors.cost_price = 'Valid cost price required';
        }

        const stock = parseInt(formData.current_stock);
        if (isNaN(stock) || stock < 0) {
            newErrors.current_stock = 'Valid stock quantity required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        const productData = {
            name: formData.name.trim(),
            sku: formData.sku.trim().toUpperCase(),
            barcode: formData.barcode.trim() || undefined,
            description: formData.description.trim() || undefined,
            unit_price: parseFloat(formData.unit_price) || 0,
            cost_price: parseFloat(formData.cost_price) || 0,
            tax_rate: parseFloat(formData.tax_rate) || 0,
            current_stock: parseInt(formData.current_stock) || 0,
            minimum_stock: parseInt(formData.minimum_stock) || 5,
            unit: formData.unit || 'pcs',
            is_active: formData.is_active,
        };

        console.log('Creating product with data:', productData);

        const success = await createProduct(productData);
        if (success) {
            Alert.alert('Success', 'Product added successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } else {
            Alert.alert('Error', 'Failed to create product. Please try again.');
        }
    };

    // Barcode Scanner Modal
    if (showScanner) {
        return (
            <Modal animationType="slide" visible={showScanner}>
                <YStack flex={1} backgroundColor="black">
                    <SafeAreaView style={{ flex: 1 }}>
                        <XStack padding="$4" justifyContent="space-between" alignItems="center">
                            <Text color="white" fontSize="$5" fontWeight="bold">Scan Barcode</Text>
                            <Pressable onPress={() => setShowScanner(false)}>
                                <X size={28} color="white" />
                            </Pressable>
                        </XStack>

                        <CameraView
                            style={StyleSheet.absoluteFillObject}
                            barcodeScannerSettings={{
                                barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'code93', 'qr'],
                            }}
                            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                        />

                        {/* Scan Guide */}
                        <YStack
                            position="absolute"
                            top="35%"
                            left="10%"
                            right="10%"
                            height={200}
                            borderWidth={2}
                            borderColor="white"
                            borderRadius="$4"
                            opacity={0.7}
                        />
                        <YStack position="absolute" bottom="20%" left="10%" right="10%">
                            <Text color="white" textAlign="center" fontSize="$4">
                                Position barcode within the frame
                            </Text>
                        </YStack>
                    </SafeAreaView>
                </YStack>
            </Modal>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
            <YStack flex={1} backgroundColor="$background">
                {/* Header */}
                <Animated.View entering={FadeInDown.springify()}>
                    <XStack paddingHorizontal="$5" paddingVertical="$4" alignItems="center" gap="$3">
                        <Pressable onPress={() => router.back()}>
                            <ArrowLeft size={24} color="$color" />
                        </Pressable>
                        <H2 color="$color" flex={1}>Add Product</H2>
                    </XStack>
                </Animated.View>

                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 + insets.bottom }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <YStack gap="$4">
                        {/* Barcode Scanner */}
                        <Animated.View entering={FadeInDown.delay(100).springify()}>
                            <Card padding="$4">
                                <YStack alignItems="center" gap="$3">
                                    <XStack
                                        backgroundColor="$backgroundHover"
                                        padding="$4"
                                        borderRadius="$4"
                                    >
                                        <Package size={40} color="$primary" />
                                    </XStack>
                                    <Text color="$muted" textAlign="center">
                                        Scan or enter barcode (optional)
                                    </Text>
                                    <Button
                                        variant="primary"
                                        size="large"
                                        onPress={openScanner}
                                    >
                                        <Camera size={20} color="white" />
                                        <Text color="white" fontWeight="600">Scan Barcode</Text>
                                    </Button>
                                    {formData.barcode && (
                                        <XStack backgroundColor="$success" paddingHorizontal="$3" paddingVertical="$2" borderRadius="$2">
                                            <Text color="white" fontWeight="600">{formData.barcode}</Text>
                                        </XStack>
                                    )}
                                </YStack>
                            </Card>
                        </Animated.View>

                        {/* Basic Info */}
                        <Animated.View entering={FadeInDown.delay(150).springify()}>
                            <Card padding="$4">
                                <YStack gap="$4">
                                    <Text fontSize="$4" fontWeight="bold" color="$color">Basic Information</Text>

                                    <FormField
                                        label="Product Name *"
                                        value={formData.name}
                                        onChangeText={(v) => updateField('name', v)}
                                        error={errors.name}
                                        placeholder="e.g. Coca Cola 500ml"
                                    />

                                    <XStack gap="$3">
                                        <YStack flex={1}>
                                            <FormField
                                                label="SKU *"
                                                value={formData.sku}
                                                onChangeText={(v) => updateField('sku', v)}
                                                error={errors.sku}
                                                placeholder="e.g. CC500"
                                                autoCapitalize="characters"
                                            />
                                        </YStack>
                                        <YStack flex={1}>
                                            <FormField
                                                label="Barcode"
                                                value={formData.barcode}
                                                onChangeText={(v) => updateField('barcode', v)}
                                                placeholder="Optional"
                                            />
                                        </YStack>
                                    </XStack>

                                    <FormField
                                        label="Description"
                                        value={formData.description}
                                        onChangeText={(v) => updateField('description', v)}
                                        placeholder="Product description (optional)"
                                        multiline
                                    />
                                </YStack>
                            </Card>
                        </Animated.View>

                        {/* Pricing */}
                        <Animated.View entering={FadeInDown.delay(200).springify()}>
                            <Card padding="$4">
                                <YStack gap="$4">
                                    <Text fontSize="$4" fontWeight="bold" color="$color">Pricing</Text>

                                    <XStack gap="$3">
                                        <YStack flex={1}>
                                            <FormField
                                                label="Selling Price (R) *"
                                                value={formData.unit_price}
                                                onChangeText={(v) => updateField('unit_price', v)}
                                                error={errors.unit_price}
                                                placeholder="0.00"
                                                keyboardType="decimal-pad"
                                            />
                                        </YStack>
                                        <YStack flex={1}>
                                            <FormField
                                                label="Cost Price (R) *"
                                                value={formData.cost_price}
                                                onChangeText={(v) => updateField('cost_price', v)}
                                                error={errors.cost_price}
                                                placeholder="0.00"
                                                keyboardType="decimal-pad"
                                            />
                                        </YStack>
                                    </XStack>

                                    <XStack gap="$3">
                                        <YStack flex={1}>
                                            <FormField
                                                label="Tax Rate (%)"
                                                value={formData.tax_rate}
                                                onChangeText={(v) => updateField('tax_rate', v)}
                                                placeholder="15"
                                                keyboardType="decimal-pad"
                                            />
                                        </YStack>
                                        <YStack flex={1}>
                                            <FormField
                                                label="Unit"
                                                value={formData.unit}
                                                onChangeText={(v) => updateField('unit', v)}
                                                placeholder="pcs"
                                            />
                                        </YStack>
                                    </XStack>
                                </YStack>
                            </Card>
                        </Animated.View>

                        {/* Stock */}
                        <Animated.View entering={FadeInDown.delay(250).springify()}>
                            <Card padding="$4">
                                <YStack gap="$4">
                                    <Text fontSize="$4" fontWeight="bold" color="$color">Inventory</Text>

                                    <XStack gap="$3">
                                        <YStack flex={1}>
                                            <FormField
                                                label="Current Stock *"
                                                value={formData.current_stock}
                                                onChangeText={(v) => updateField('current_stock', v)}
                                                error={errors.current_stock}
                                                placeholder="0"
                                                keyboardType="number-pad"
                                            />
                                        </YStack>
                                        <YStack flex={1}>
                                            <FormField
                                                label="Minimum Stock"
                                                value={formData.minimum_stock}
                                                onChangeText={(v) => updateField('minimum_stock', v)}
                                                placeholder="5"
                                                keyboardType="number-pad"
                                            />
                                        </YStack>
                                    </XStack>
                                </YStack>
                            </Card>
                        </Animated.View>

                        {/* Status */}
                        <Animated.View entering={FadeInDown.delay(300).springify()}>
                            <Card padding="$4">
                                <XStack justifyContent="space-between" alignItems="center">
                                    <YStack>
                                        <Text fontSize="$4" fontWeight="bold" color="$color">Active</Text>
                                        <Text fontSize="$2" color="$muted">Product is available for sale</Text>
                                    </YStack>
                                    <Switch
                                        value={formData.is_active}
                                        onValueChange={(v) => updateField('is_active', v)}
                                        trackColor={{ false: '#D1D5DB', true: '#6366F1' }}
                                        thumbColor={formData.is_active ? '#fff' : '#f4f3f4'}
                                    />
                                </XStack>
                            </Card>
                        </Animated.View>
                    </YStack>
                </ScrollView>

                {/* Submit Button */}
                <YStack
                    padding="$5"
                    backgroundColor="$card"
                    borderTopWidth={1}
                    borderTopColor="$border"
                    paddingBottom={20 + insets.bottom}
                >
                    <Button
                        variant="primary"
                        size="large"
                        fullWidth
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <XStack alignItems="center" gap="$2">
                                <ActivityIndicator size="small" color="white" />
                                <Text color="white" fontWeight="600">Creating...</Text>
                            </XStack>
                        ) : (
                            <Text color="white" fontWeight="600">Add Product</Text>
                        )}
                    </Button>
                </YStack>
            </YStack>
        </SafeAreaView>
    );
}

// Simple form field component
function FormField({
    label,
    value,
    onChangeText,
    error,
    placeholder,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    multiline = false,
}: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    error?: string;
    placeholder?: string;
    keyboardType?: 'default' | 'decimal-pad' | 'number-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    multiline?: boolean;
}) {
    return (
        <YStack gap="$2">
            <Text fontSize="$3" fontWeight="600" color="$color">{label}</Text>
            <XStack
                backgroundColor="$background"
                borderRadius="$3"
                borderWidth={error ? 2 : 1}
                borderColor={error ? '$danger' : '$border'}
                padding="$3"
                minHeight={multiline ? 100 : 48}
            >
                <TextInput
                    style={{
                        flex: 1,
                        fontSize: 16,
                        color: '#1A1A1A',
                        textAlignVertical: multiline ? 'top' : 'center',
                    }}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    multiline={multiline}
                />
            </XStack>
            {error && <Text fontSize="$2" color="$danger">{error}</Text>}
        </YStack>
    );
}
