import { Lock, Mail } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Spinner, Text, XStack, YStack } from 'tamagui';

import { Button, Input } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';

export default function LoginScreen() {
    const router = useRouter();
    const { login, isLoading, error, clearError } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const validate = (): boolean => {
        const newErrors: typeof errors = {};

        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        // } else if (password.length < 1) {
        //     newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validate()) return;
        clearError();

        const success = await login(email, password);
        if (success) {
            router.replace('/(tabs)');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <YStack
                flex={1}
                backgroundColor="$background"
                paddingHorizontal="$5"
                paddingTop="$10"
                justifyContent="center"
            >
                {/* Logo & Title */}
                <Animated.View entering={FadeInUp.delay(100).springify()}>
                    <YStack alignItems="center" marginBottom="$8">
                        <XStack
                            backgroundColor="$primary"
                            padding="$4"
                            borderRadius="$5"
                            marginBottom="$4"
                        >
                            <Text fontSize={32}>📦</Text>
                        </XStack>
                        <Text fontSize="$8" fontWeight="bold" color="$color">
                            StockFlow
                        </Text>
                        <Text fontSize="$4" color="$muted" marginTop="$2">
                            Inventory Management Made Simple
                        </Text>
                    </YStack>
                </Animated.View>

                {/* Form */}
                <Animated.View entering={FadeInDown.delay(200).springify()}>
                    <YStack gap="$4">
                        <Input
                            label="Email"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (errors.email) setErrors({ ...errors, email: undefined });
                            }}
                            error={errors.email}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            icon={<Mail size={20} color="$muted" />}
                        />

                        <Input
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (errors.password) setErrors({ ...errors, password: undefined });
                            }}
                            error={errors.password}
                            secureTextEntry
                            icon={<Lock size={20} color="$muted" />}
                        />

                        {error && (
                            <XStack
                                backgroundColor="$danger"
                                padding="$3"
                                borderRadius="$3"
                                opacity={0.1}
                            >
                                <Text color="$danger" fontSize="$3">
                                    {error}
                                </Text>
                            </XStack>
                        )}

                        <Button
                            variant="primary"
                            size="large"
                            fullWidth
                            onPress={handleLogin}
                            disabled={isLoading}
                            marginTop="$4"
                        >
                            {isLoading ? (
                                <Spinner color="white" />
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </YStack>
                </Animated.View>

                {/* Register Link */}
                <Animated.View entering={FadeInDown.delay(300).springify()}>
                    <XStack justifyContent="center" marginTop="$6" gap="$2">
                        <Text color="$muted">Don't have an account?</Text>
                        <Text
                            color="$primary"
                            fontWeight="600"
                            onPress={() => router.push('/(auth)/register')}
                            pressStyle={{ opacity: 0.7 }}
                        >
                            Sign Up
                        </Text>
                    </XStack>
                </Animated.View>
            </YStack>
        </KeyboardAvoidingView>
    );
}
