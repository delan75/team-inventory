import { useEffect, useCallback } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { YStack, XStack, Text, H2 } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  TrendingUp,
  AlertTriangle,
  Users,
  Plus,
  Package,
  DollarSign,
  ShoppingBag,
  BarChart3
} from '@tamagui/lucide-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

import { StatCard, ListCard, Button } from '../../components/ui';
import { useDashboardStore } from '../../stores/dashboardStore';
import { useShopStore } from '../../stores/shopStore';
import { useAuthStore } from '../../stores/authStore';

export default function DashboardScreen() {
  const router = useRouter();
  const { data, isLoading, fetchDashboard } = useDashboardStore();
  const { activeShop } = useShopStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (activeShop) {
      fetchDashboard();
    }
  }, [activeShop]);

  const onRefresh = useCallback(async () => {
    await fetchDashboard();
  }, []);

  const formatCurrency = (amount: number | undefined | null) => {
    const value = typeof amount === 'number' ? amount : 0;
    return `R ${value.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <YStack flex={1} backgroundColor="$background">
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(50).springify()}>
          <XStack
            paddingHorizontal="$5"
            paddingVertical="$4"
            justifyContent="space-between"
            alignItems="center"
          >
            <YStack>
              <Text fontSize="$3" color="$muted">
                Welcome back,
              </Text>
              <H2 color="$color">
                {user?.first_name || 'User'}
              </H2>
            </YStack>
            <XStack
              backgroundColor="$backgroundHover"
              padding="$3"
              borderRadius="$3"
              alignItems="center"
              gap="$2"
            >
              <Package size={16} color="$primary" />
              <Text fontSize="$3" fontWeight="600" color="$color">
                {activeShop?.name || 'No Shop'}
              </Text>
            </XStack>
          </XStack>
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
          }
        >
          <YStack paddingHorizontal="$5" gap="$4" paddingBottom="$6">
            {/* Quick Actions */}
            <Animated.View entering={FadeInDown.delay(100).springify()}>
              <XStack gap="$3">
                <Button
                  flex={1}
                  variant="primary"
                  size="large"
                  onPress={() => router.push('/(tabs)/pos')}
                >
                  <Plus size={20} color="white" />
                  <Text color="white" fontWeight="600">New Sale</Text>
                </Button>
                <Button
                  flex={1}
                  variant="secondary"
                  size="large"
                  onPress={() => router.push('/(tabs)/products')}
                >
                  <Package size={20} color="$color" />
                  <Text color="$color" fontWeight="600">Products</Text>
                </Button>
              </XStack>
            </Animated.View>

            {/* Sales Stats */}
            <Animated.View entering={FadeInDown.delay(150).springify()}>
              <Text fontSize="$5" fontWeight="bold" color="$color" marginBottom="$3">
                Sales Overview
              </Text>
              <XStack gap="$3">
                <YStack flex={1}>
                  <StatCard
                    title="Today"
                    value={formatCurrency(data?.sales.today || 0)}
                    icon={<TrendingUp size={24} color="$success" />}
                  />
                </YStack>
                <YStack flex={1}>
                  <StatCard
                    title="This Week"
                    value={formatCurrency(data?.sales.this_week || 0)}
                    icon={<BarChart3 size={24} color="$info" />}
                  />
                </YStack>
              </XStack>
            </Animated.View>

            <Animated.View entering={FadeInRight.delay(200).springify()}>
              <StatCard
                title="This Month"
                value={formatCurrency(data?.sales.this_month || 0)}
                subtitle="Total revenue"
                icon={<DollarSign size={24} color="$primary" />}
              />
            </Animated.View>

            {/* Alerts */}
            <Animated.View entering={FadeInDown.delay(250).springify()}>
              <Text fontSize="$5" fontWeight="bold" color="$color" marginBottom="$3">
                Alerts
              </Text>
              <XStack gap="$3">
                <YStack flex={1}>
                  <StatCard
                    title="Low Stock"
                    value={data?.alerts.low_stock_count || 0}
                    icon={<AlertTriangle size={24} color="$warning" />}
                    onPress={() => {/* Navigate to alerts */ }}
                  />
                </YStack>
                <YStack flex={1}>
                  <StatCard
                    title="Out of Stock"
                    value={data?.alerts.out_of_stock_count || 0}
                    icon={<Package size={24} color="$danger" />}
                    onPress={() => {/* Navigate to alerts */ }}
                  />
                </YStack>
              </XStack>
            </Animated.View>

            {/* Credit Sales */}
            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <Text fontSize="$5" fontWeight="bold" color="$color" marginBottom="$3">
                Credit Sales
              </Text>
              <XStack gap="$3">
                <YStack flex={1}>
                  <StatCard
                    title="Pending"
                    value={data?.credit.pending_sales_count || 0}
                    icon={<ShoppingBag size={24} color="$warning" />}
                  />
                </YStack>
                <YStack flex={1}>
                  <StatCard
                    title="Outstanding"
                    value={formatCurrency(data?.credit.total_outstanding_debt || 0)}
                    icon={<Users size={24} color="$danger" />}
                  />
                </YStack>
              </XStack>
            </Animated.View>

            {/* Top Products */}
            {data?.top_products_today && data.top_products_today.length > 0 && (
              <Animated.View entering={FadeInDown.delay(350).springify()}>
                <Text fontSize="$5" fontWeight="bold" color="$color" marginBottom="$3">
                  Top Products Today
                </Text>
                <YStack gap="$2">
                  {data.top_products_today.slice(0, 5).map((product, index) => (
                    <ListCard
                      key={index}
                      title={product.product__name}
                      subtitle={`${product.quantity_sold} sold`}
                      rightContent={
                        <Text fontWeight="600" color="$success">
                          {formatCurrency(product.revenue)}
                        </Text>
                      }
                      showArrow={false}
                    />
                  ))}
                </YStack>
              </Animated.View>
            )}
          </YStack>
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}
