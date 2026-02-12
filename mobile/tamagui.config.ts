import { createTamagui } from 'tamagui';
import { config } from '@tamagui/config/v3';

// Custom theme colors for inventory app
const customConfig = createTamagui({
    ...config,
    themes: {
        ...config.themes,
        light: {
            ...config.themes.light,
            background: '#FFFFFF',
            backgroundHover: '#F5F5F5',
            backgroundPress: '#EEEEEE',
            color: '#1A1A1A',
            colorHover: '#333333',
            primary: '#6366F1', // Indigo
            primaryHover: '#4F46E5',
            success: '#10B981', // Emerald
            warning: '#F59E0B', // Amber
            danger: '#EF4444', // Red
            info: '#3B82F6', // Blue
            muted: '#9CA3AF',
            card: '#FFFFFF',
            cardHover: '#FAFAFA',
            border: '#E5E7EB',
        },
        dark: {
            ...config.themes.dark,
            background: '#0F172A',
            backgroundHover: '#1E293B',
            backgroundPress: '#334155',
            color: '#F8FAFC',
            colorHover: '#E2E8F0',
            primary: '#818CF8', // Indigo light
            primaryHover: '#6366F1',
            success: '#34D399',
            warning: '#FBBF24',
            danger: '#F87171',
            info: '#60A5FA',
            muted: '#64748B',
            card: '#1E293B',
            cardHover: '#334155',
            border: '#334155',
        },
    },
});

export type AppConfig = typeof customConfig;

declare module 'tamagui' {
    interface TamaguiCustomConfig extends AppConfig { }
}

export default customConfig;
