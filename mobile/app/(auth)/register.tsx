import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { YStack, XStack, Text, Spinner } from 'tamagui';
import { useRouter } from 'expo-router';
import { Mail, Lock, User, ArrowLeft } from '@tamagui/lucide-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Input } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';

export default function RegisterScreen() {
    const router = useRouter();
    const { register, isLoading, error, clearError } = useAuthStore();

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const updateField = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.first_name.trim()) {
            newErrors.first_name = 'First name is required';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) return;
        clearError();

        const success = await register({
            email: formData.email,
            password: formData.password,
            first_name: formData.first_name,
            last_name: formData.last_name,
        });

        if (success) {
            router.replace('/(tabs)');
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <YStack
                        flex={1}
                        backgroundColor="$background"
                        paddingHorizontal="$5"
                        paddingVertical="$6"
                    >
                        {/* Back Button */}
                        <Animated.View entering={FadeInUp.delay(50).springify()}>
                            <XStack
                                alignItems="center"
                                gap="$2"
                                marginBottom="$6"
                                onPress={() => router.back()}
                                pressStyle={{ opacity: 0.7 }}
                            >
                                <ArrowLeft size={24} color="$color" />
                                <Text fontSize="$4" color="$color">Back</Text>
                            </XStack>
                        </Animated.View>

                        {/* Title */}
                        <Animated.View entering={FadeInUp.delay(100).springify()}>
                            <YStack marginBottom="$6">
                                <Text fontSize="$8" fontWeight="bold" color="$color">
                                    Create Account
                                </Text>
                                <Text fontSize="$4" color="$muted" marginTop="$2">
                                    Start managing your inventory today
                                </Text>
                            </YStack>
                        </Animated.View>

                        {/* Form */}
                        <Animated.View entering={FadeInDown.delay(200).springify()}>
                            <YStack gap="$4">
                                <XStack gap="$3">
                                    <YStack flex={1}>
                                        <Input
                                            label="First Name"
                                            placeholder="John"
                                            value={formData.first_name}
                                            onChangeText={(text) => updateField('first_name', text)}
                                            error={errors.first_name}
                                            autoCapitalize="words"
                                            icon={<User size={20} color="$muted" />}
                                        />
                                    </YStack>
                                    <YStack flex={1}>
                                        <Input
                                            label="Last Name"
                                            placeholder="Doe"
                                            value={formData.last_name}
                                            onChangeText={(text) => updateField('last_name', text)}
                                            autoCapitalize="words"
                                        />
                                    </YStack>
                                </XStack>

                                <Input
                                    label="Email"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChangeText={(text) => updateField('email', text)}
                                    error={errors.email}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    icon={<Mail size={20} color="$muted" />}
                                />

                                <Input
                                    label="Password"
                                    placeholder="At least 6 characters"
                                    value={formData.password}
                                    onChangeText={(text) => updateField('password', text)}
                                    error={errors.password}
                                    secureTextEntry
                                    icon={<Lock size={20} color="$muted" />}
                                />

                                <Input
                                    label="Confirm Password"
                                    placeholder="Repeat your password"
                                    value={formData.confirmPassword}
                                    onChangeText={(text) => updateField('confirmPassword', text)}
                                    error={errors.confirmPassword}
                                    secureTextEntry
                                    icon={<Lock size={20} color="$muted" />}
                                />

                                {error && (
                                    <XStack
                                        backgroundColor="rgba(239, 68, 68, 0.1)"
                                        padding="$3"
                                        borderRadius="$3"
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
                                    onPress={handleRegister}
                                    disabled={isLoading}
                                    marginTop="$4"
                                >
                                    {isLoading ? (
                                        <Spinner color="white" />
                                    ) : (
                                        'Create Account'
                                    )}
                                </Button>
                            </YStack>
                        </Animated.View>

                        {/* Login Link */}
                        <Animated.View entering={FadeInDown.delay(300).springify()}>
                            <XStack justifyContent="center" marginTop="$6" gap="$2">
                                <Text color="$muted">Already have an account?</Text>
                                <Text
                                    color="$primary"
                                    fontWeight="600"
                                    onPress={() => router.push('/(auth)/login')}
                                    pressStyle={{ opacity: 0.7 }}
                                >
                                    Sign In
                                </Text>
                            </XStack>
                        </Animated.View>
                    </YStack>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
