import { Input as TamaguiInput, XStack, Text, YStack } from 'tamagui';
import { Eye, EyeOff } from '@tamagui/lucide-icons';
import { useState } from 'react';
import { Pressable, TextInput, StyleSheet } from 'react-native';

interface InputProps {
    label?: string;
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
    error?: string;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    icon?: React.ReactNode;
}

export function Input({
    label,
    placeholder,
    value,
    onChangeText,
    error,
    secureTextEntry,
    keyboardType = 'default',
    autoCapitalize = 'none',
    icon,
}: InputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    return (
        <YStack gap="$2">
            {label && (
                <Text fontSize="$3" fontWeight="600" color="$color">
                    {label}
                </Text>
            )}
            <XStack
                backgroundColor="$background"
                borderRadius="$3"
                borderWidth={error ? 2 : isFocused ? 2 : 1}
                borderColor={error ? '$danger' : isFocused ? '$primary' : '$border'}
                alignItems="center"
                height={48}
            >
                {icon && (
                    <XStack paddingLeft="$3">
                        {icon}
                    </XStack>
                )}
                <TextInput
                    style={[
                        styles.input,
                        { paddingLeft: icon ? 8 : 16 }
                    ]}
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry && !showPassword}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
                {secureTextEntry && (
                    <Pressable
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeButton}
                    >
                        {showPassword ? (
                            <EyeOff size={20} color="#9CA3AF" />
                        ) : (
                            <Eye size={20} color="#9CA3AF" />
                        )}
                    </Pressable>
                )}
            </XStack>
            {error && (
                <Text fontSize="$2" color="$danger">
                    {error}
                </Text>
            )}
        </YStack>
    );
}

const styles = StyleSheet.create({
    input: {
        flex: 1,
        height: 48,
        fontSize: 16,
        color: '#1A1A1A',
        paddingRight: 16,
    },
    eyeButton: {
        padding: 12,
    },
});
