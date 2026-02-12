import { useState, useEffect } from 'react';
import { FlatList, Pressable, Alert, TextInput, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { YStack, XStack, Text, H2 } from 'tamagui';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    ArrowLeft,
    Plus,
    Edit3,
    Trash2,
    FolderOpen,
    X,
    Check,
} from '@tamagui/lucide-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

import { Button, Card } from '../../components/ui';
import { useCategoriesStore, Category } from '../../stores/categoriesStore';
import { useShopStore } from '../../stores/shopStore';

export default function CategoriesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { categories, isLoading, fetchCategories, createCategory, updateCategory, deleteCategory } = useCategoriesStore();
    const { activeShop } = useShopStore();

    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (activeShop) {
            fetchCategories();
        }
    }, [activeShop]);

    const handleOpenModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setName(category.name);
            setDescription(category.description || '');
        } else {
            setEditingCategory(null);
            setName('');
            setDescription('');
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Category name is required');
            return;
        }

        let success;
        if (editingCategory) {
            success = await updateCategory(editingCategory.id, name, description);
        } else {
            success = await createCategory(name, description);
        }

        if (success) {
            setShowModal(false);
            setName('');
            setDescription('');
            setEditingCategory(null);
        }
    };

    const handleDelete = (category: Category) => {
        Alert.alert(
            'Delete Category',
            `Are you sure you want to delete "${category.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteCategory(category.id),
                },
            ]
        );
    };

    const renderCategory = ({ item, index }: { item: Category; index: number }) => (
        <Animated.View entering={FadeInRight.delay(index * 50).springify()}>
            <Card padding="$4" marginBottom="$3">
                <XStack alignItems="center" justifyContent="space-between">
                    <XStack alignItems="center" gap="$3" flex={1}>
                        <XStack backgroundColor="$backgroundHover" padding="$3" borderRadius="$3">
                            <FolderOpen size={24} color="$primary" />
                        </XStack>
                        <YStack flex={1}>
                            <Text fontSize="$4" fontWeight="600" color="$color">{item.name}</Text>
                            {item.description && (
                                <Text fontSize="$3" color="$muted" numberOfLines={1}>{item.description}</Text>
                            )}
                            {item.product_count !== undefined && (
                                <Text fontSize="$2" color="$muted">{item.product_count} products</Text>
                            )}
                        </YStack>
                    </XStack>

                    <XStack gap="$2">
                        <Pressable onPress={() => handleOpenModal(item)}>
                            <XStack backgroundColor="$backgroundHover" padding="$2" borderRadius="$2">
                                <Edit3 size={18} color="$primary" />
                            </XStack>
                        </Pressable>
                        <Pressable onPress={() => handleDelete(item)}>
                            <XStack backgroundColor="rgba(239, 68, 68, 0.1)" padding="$2" borderRadius="$2">
                                <Trash2 size={18} color="$danger" />
                            </XStack>
                        </Pressable>
                    </XStack>
                </XStack>
            </Card>
        </Animated.View>
    );

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
                            <H2 color="$color">Categories</H2>
                        </XStack>
                        <Pressable onPress={() => handleOpenModal()}>
                            <XStack backgroundColor="$primary" padding="$2" borderRadius="$3" alignItems="center" gap="$2">
                                <Plus size={20} color="white" />
                                <Text color="white" fontWeight="600">Add</Text>
                            </XStack>
                        </Pressable>
                    </XStack>
                </Animated.View>

                {isLoading && categories.length === 0 ? (
                    <YStack flex={1} justifyContent="center" alignItems="center">
                        <ActivityIndicator size="large" color="#6366F1" />
                    </YStack>
                ) : (
                    <FlatList
                        data={categories}
                        keyExtractor={(item) => item.id}
                        renderItem={renderCategory}
                        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 + insets.bottom }}
                        ListEmptyComponent={
                            <YStack flex={1} alignItems="center" padding="$10" gap="$4">
                                <FolderOpen size={64} color="$muted" />
                                <Text color="$muted">No categories yet</Text>
                                <Button variant="primary" onPress={() => handleOpenModal()}>
                                    <Plus size={18} color="white" />
                                    <Text color="white">Create Category</Text>
                                </Button>
                            </YStack>
                        }
                    />
                )}

                {/* Add/Edit Modal */}
                <Modal visible={showModal} animationType="slide" transparent>
                    <Pressable style={styles.modalOverlay} onPress={() => setShowModal(false)}>
                        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                            <YStack padding="$5" gap="$4">
                                <XStack justifyContent="space-between" alignItems="center">
                                    <Text fontSize="$5" fontWeight="bold" color="$color">
                                        {editingCategory ? 'Edit Category' : 'New Category'}
                                    </Text>
                                    <Pressable onPress={() => setShowModal(false)}>
                                        <X size={24} color="$muted" />
                                    </Pressable>
                                </XStack>

                                <YStack gap="$2">
                                    <Text fontSize="$3" fontWeight="600" color="$color">Name *</Text>
                                    <XStack
                                        backgroundColor="$background"
                                        borderRadius="$3"
                                        borderWidth={1}
                                        borderColor="$border"
                                        padding="$3"
                                    >
                                        <TextInput
                                            style={styles.input}
                                            value={name}
                                            onChangeText={setName}
                                            placeholder="e.g. Beverages"
                                            placeholderTextColor="#9CA3AF"
                                        />
                                    </XStack>
                                </YStack>

                                <YStack gap="$2">
                                    <Text fontSize="$3" fontWeight="600" color="$color">Description</Text>
                                    <XStack
                                        backgroundColor="$background"
                                        borderRadius="$3"
                                        borderWidth={1}
                                        borderColor="$border"
                                        padding="$3"
                                        minHeight={80}
                                    >
                                        <TextInput
                                            style={[styles.input, { textAlignVertical: 'top' }]}
                                            value={description}
                                            onChangeText={setDescription}
                                            placeholder="Optional description"
                                            placeholderTextColor="#9CA3AF"
                                            multiline
                                        />
                                    </XStack>
                                </YStack>

                                <Button variant="primary" size="large" fullWidth onPress={handleSave} disabled={isLoading}>
                                    <Check size={20} color="white" />
                                    <Text color="white" fontWeight="600">
                                        {editingCategory ? 'Update' : 'Create'}
                                    </Text>
                                </Button>
                            </YStack>
                        </Pressable>
                    </Pressable>
                </Modal>
            </YStack>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1A1A1A',
    },
});
