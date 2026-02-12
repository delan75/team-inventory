import { create } from 'zustand';
import api from '../services/api';

export interface Category {
    id: string;
    name: string;
    description?: string;
    product_count?: number;
}

interface CategoriesState {
    categories: Category[];
    isLoading: boolean;
    error: string | null;

    fetchCategories: () => Promise<void>;
    createCategory: (name: string, description?: string) => Promise<boolean>;
    updateCategory: (id: string, name: string, description?: string) => Promise<boolean>;
    deleteCategory: (id: string) => Promise<boolean>;
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
    categories: [],
    isLoading: false,
    error: null,

    fetchCategories: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/products/categories/');
            const categories = response.data.data || response.data;
            set({ categories, isLoading: false });
        } catch (error: any) {
            set({ error: 'Failed to load categories', isLoading: false });
        }
    },

    createCategory: async (name: string, description?: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/products/categories/', { name, description });
            const newCategory = response.data.data || response.data;
            set((state) => ({
                categories: [...state.categories, newCategory],
                isLoading: false,
            }));
            return true;
        } catch (error: any) {
            set({ error: 'Failed to create category', isLoading: false });
            return false;
        }
    },

    updateCategory: async (id: string, name: string, description?: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.put(`/products/categories/${id}/`, { name, description });
            const updated = response.data.data || response.data;
            set((state) => ({
                categories: state.categories.map((c) => (c.id === id ? updated : c)),
                isLoading: false,
            }));
            return true;
        } catch (error: any) {
            set({ error: 'Failed to update category', isLoading: false });
            return false;
        }
    },

    deleteCategory: async (id: string) => {
        try {
            await api.delete(`/products/categories/${id}/`);
            set((state) => ({
                categories: state.categories.filter((c) => c.id !== id),
            }));
            return true;
        } catch (error: any) {
            set({ error: 'Failed to delete category' });
            return false;
        }
    },
}));
