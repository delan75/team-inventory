import { Card as TamaguiCard, styled, XStack, YStack, Text } from 'tamagui';
import { ChevronRight } from '@tamagui/lucide-icons';

export const Card = styled(TamaguiCard, {
    name: 'Card',
    backgroundColor: '$card',
    borderRadius: '$4',
    padding: '$4',
    borderWidth: 1,
    borderColor: '$border',

    pressStyle: {
        scale: 0.98,
        backgroundColor: '$cardHover',
    },

    animation: 'quick',

    variants: {
        elevated: {
            true: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
            },
        },
        interactive: {
            true: {
                cursor: 'pointer',
            },
        },
    } as const,
});

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    onPress?: () => void;
}

export function StatCard({
    title,
    value,
    subtitle,
    icon,
    trend,
    trendValue,
    onPress,
}: StatCardProps) {
    const trendColor = trend === 'up' ? '$success' : trend === 'down' ? '$danger' : '$muted';

    return (
        <Card
            elevated
            interactive={!!onPress}
            onPress={onPress}
            pressStyle={onPress ? { scale: 0.98 } : undefined}
        >
            <XStack justifyContent="space-between" alignItems="flex-start">
                <YStack gap="$2" flex={1}>
                    <Text fontSize="$3" color="$muted" fontWeight="500">
                        {title}
                    </Text>
                    <Text fontSize="$7" fontWeight="bold" color="$color">
                        {value}
                    </Text>
                    {subtitle && (
                        <Text fontSize="$2" color="$muted">
                            {subtitle}
                        </Text>
                    )}
                    {trendValue && (
                        <XStack alignItems="center" gap="$1">
                            <Text fontSize="$2" color={trendColor} fontWeight="600">
                                {trendValue}
                            </Text>
                        </XStack>
                    )}
                </YStack>
                {icon && (
                    <XStack
                        backgroundColor="$backgroundHover"
                        padding="$3"
                        borderRadius="$3"
                    >
                        {icon}
                    </XStack>
                )}
            </XStack>
        </Card>
    );
}

interface ListCardProps {
    title: string;
    subtitle?: string;
    leftIcon?: React.ReactNode;
    rightContent?: React.ReactNode;
    showArrow?: boolean;
    onPress?: () => void;
}

export function ListCard({
    title,
    subtitle,
    leftIcon,
    rightContent,
    showArrow = true,
    onPress,
}: ListCardProps) {
    return (
        <Card
            interactive={!!onPress}
            onPress={onPress}
            padding="$3"
        >
            <XStack alignItems="center" gap="$3">
                {leftIcon && (
                    <XStack
                        backgroundColor="$backgroundHover"
                        padding="$2"
                        borderRadius="$2"
                    >
                        {leftIcon}
                    </XStack>
                )}
                <YStack flex={1}>
                    <Text fontSize="$4" fontWeight="600" color="$color">
                        {title}
                    </Text>
                    {subtitle && (
                        <Text fontSize="$3" color="$muted">
                            {subtitle}
                        </Text>
                    )}
                </YStack>
                {rightContent}
                {showArrow && onPress && (
                    <ChevronRight size={20} color="$muted" />
                )}
            </XStack>
        </Card>
    );
}
