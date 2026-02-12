import { Stack } from 'expo-router';

export default function ProductLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="add" />
            <Stack.Screen name="[id]" />
        </Stack>
    );
}
