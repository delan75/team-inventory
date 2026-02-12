import { create } from 'zustand';
import api, { tokenStorage } from '../services/api';

interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (email: string, password: string) => Promise<boolean>;
    register: (data: RegisterData) => Promise<boolean>;
    logout: () => Promise<void>;
    loadUser: () => Promise<void>;
    clearError: () => void;
}

interface RegisterData {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,

    login: async (email: string, password: string): Promise<boolean> => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/auth/login/', { email, password });
            const { access, refresh } = response.data;

            await tokenStorage.setAccessToken(access);
            await tokenStorage.setRefreshToken(refresh);

            // Fetch user profile
            await get().loadUser();

            return true;
        } catch (error: any) {
            const message = error.response?.data?.detail || 'Login failed';
            set({ error: message, isLoading: false });
            return false;
        }
    },

    register: async (data: RegisterData): Promise<boolean> => {
        set({ isLoading: true, error: null });
        try {
            await api.post('/auth/register/', data);
            // Auto-login after registration
            return await get().login(data.email, data.password);
        } catch (error: any) {
            const message = error.response?.data?.email?.[0] ||
                error.response?.data?.detail ||
                'Registration failed';
            set({ error: message, isLoading: false });
            return false;
        }
    },

    logout: async (): Promise<void> => {
        await tokenStorage.clearAll();
        set({ user: null, isAuthenticated: false, isLoading: false });
    },

    loadUser: async (): Promise<void> => {
        try {
            const token = await tokenStorage.getAccessToken();
            if (!token) {
                set({ isLoading: false, isAuthenticated: false });
                return;
            }

            const response = await api.get('/auth/me/');
            set({
                user: response.data.data || response.data,
                isAuthenticated: true,
                isLoading: false
            });
        } catch (error) {
            await tokenStorage.clearAll();
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },

    clearError: () => set({ error: null }),
}));
