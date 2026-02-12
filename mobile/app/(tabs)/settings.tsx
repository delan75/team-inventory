import { YStack, XStack, Text, H2 } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import {
    User,
    Store,
    Bell,
    Moon,
    LogOut,
    Shield,
    FolderOpen,
    Package,
    Tag,
} from '@tamagui/lucide-icons';

import { ListCard, Button } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { useShopStore } from '../../stores/shopStore';

export default function SettingsScreen() {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const { activeShop, shops } = useShopStore();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
            <YStack flex={1} backgroundColor="$background">
                <YStack paddingHorizontal="$5" paddingVertical="$4">
                    <H2 color="$color">Settings</H2>
                </YStack>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <YStack paddingHorizontal="$5" gap="$6" paddingBottom="$6">
                        {/* Profile Section */}
                        <YStack gap="$3">
                            <Text fontSize="$3" color="$muted" fontWeight="600">
                                ACCOUNT
                            </Text>
                            <ListCard
                                title={`${user?.first_name} ${user?.last_name}`}
                                subtitle={user?.email}
                                leftIcon={<User size={20} color="$primary" />}
                            />
                        </YStack>

                        {/* Shop Section */}
                        <YStack gap="$3">
                            <Text fontSize="$3" color="$muted" fontWeight="600">
                                SHOP
                            </Text>
                            <ListCard
                                title={activeShop?.name || 'No Shop Selected'}
                                subtitle={`${shops.length} shop(s) available`}
                                leftIcon={<Store size={20} color="$success" />}
                                onPress={() => {/* Shop selector modal */ }}
                            />
                        </YStack>

                        {/* Shop Management */}
                        <YStack gap="$3">
                            <Text fontSize="$3" color="$muted" fontWeight="600">
                                SHOP MANAGEMENT
                            </Text>
                            <YStack gap="$2">
                                <ListCard
                                    title="Categories"
                                    subtitle="Manage product categories"
                                    leftIcon={<FolderOpen size={20} color="$primary" />}
                                    onPress={() => router.push('/categories' as any)}
                                />
                                <ListCard
                                    title="Products"
                                    subtitle="View all products"
                                    leftIcon={<Package size={20} color="$info" />}
                                    onPress={() => router.push('/(tabs)/products' as any)}
                                />
                            </YStack>
                        </YStack>

                        {/* Preferences */}
                        <YStack gap="$3">
                            <Text fontSize="$3" color="$muted" fontWeight="600">
                                PREFERENCES
                            </Text>
                            <YStack gap="$2">
                                <ListCard
                                    title="Notifications"
                                    subtitle="Manage push notifications"
                                    leftIcon={<Bell size={20} color="$warning" />}
                                />
                                <ListCard
                                    title="Appearance"
                                    subtitle="Dark mode, theme"
                                    leftIcon={<Moon size={20} color="$muted" />}
                                />
                                <ListCard
                                    title="Security"
                                    subtitle="Password, biometrics"
                                    leftIcon={<Shield size={20} color="$danger" />}
                                />
                            </YStack>
                        </YStack>

                        {/* Logout */}
                        <YStack gap="$3" marginTop="$4">
                            <Button
                                variant="danger"
                                size="large"
                                fullWidth
                                onPress={handleLogout}
                            >
                                <LogOut size={20} color="white" />
                                <Text color="white" fontWeight="600">Sign Out</Text>
                            </Button>
                        </YStack>

                        {/* Version */}
                        <YStack alignItems="center" marginTop="$4">
                            <Text fontSize="$2" color="$muted">
                                StockFlow v1.0.0
                            </Text>
                        </YStack>
                    </YStack>
                </ScrollView>
            </YStack>
        </SafeAreaView>
    );
}
