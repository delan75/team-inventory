import { create } from 'zustand';
import api from '../services/api';

export interface ProductImage {
    id: string;
    image: string;
    is_primary: boolean;
    alt_text?: string;
    order: number;
}

export interface Product {
    id: string;
    name: string;
    sku: string;
    barcode?: string;
    description?: string;
    unit_price: number;
    cost_price: number;
    current_stock: number;
    minimum_stock: number;
    category?: {
        id: string;
        name: string;
    };
    image?: string;
    images?: ProductImage[];
    primary_image?: string;
    is_active: boolean;
}

interface ProductsState {
    products: Product[];
    currentProduct: Product | null;
    isLoading: boolean;
    error: string | null;
    searchQuery: string;

    // Actions
    fetchProducts: (search?: string) => Promise<void>;
    fetchProduct: (id: string) => Promise<Product | null>;
    setSearchQuery: (query: string) => void;
    createProduct: (data: Partial<Product>) => Promise<boolean>;
    updateProduct: (id: string, data: Partial<Product>) => Promise<boolean>;
    deleteProduct: (id: string) => Promise<boolean>;
    uploadImage: (productId: string, imageUri: string, isPrimary?: boolean) => Promise<boolean>;
}

export const useProductsStore = create<ProductsState>((set, get) => ({
    products: [],
    currentProduct: null,
    isLoading: false,
    error: null,
    searchQuery: '',

    fetchProducts: async (search?: string) => {
        set({ isLoading: true, error: null });
        try {
            const query = search || get().searchQuery;
            const url = query ? `/products/?search=${encodeURIComponent(query)}` : '/products/';
            const response = await api.get(url);
            const products = response.data.data || response.data;
            set({ products, isLoading: false });
        } catch (error: any) {
            set({ error: 'Failed to load products', isLoading: false });
        }
    },

    fetchProduct: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`/products/${id}/`);
            const product = response.data.data || response.data;
            set({ currentProduct: product, isLoading: false });
            return product;
        } catch (error: any) {
            set({ error: 'Failed to load product', isLoading: false });
            return null;
        }
    },

    setSearchQuery: (query: string) => {
        set({ searchQuery: query });
    },

    createProduct: async (data: Partial<Product>) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/products/', data);
            const newProduct = response.data.data || response.data;
            set((state) => ({
                products: [newProduct, ...state.products],
                isLoading: false,
            }));
            return true;
        } catch (error: any) {
            set({ error: 'Failed to create product', isLoading: false });
            return false;
        }
    },

    updateProduct: async (id: string, data: Partial<Product>) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.put(`/products/${id}/`, data);
            const updated = response.data.data || response.data;
            set((state) => ({
                products: state.products.map((p) => (p.id === id ? updated : p)),
                currentProduct: state.currentProduct?.id === id ? updated : state.currentProduct,
                isLoading: false,
            }));
            return true;
        } catch (error: any) {
            set({ error: 'Failed to update product', isLoading: false });
            return false;
        }
    },

    deleteProduct: async (id: string) => {
        try {
            await api.delete(`/products/${id}/`);
            set((state) => ({
                products: state.products.filter((p) => p.id !== id),
            }));
            return true;
        } catch (error: any) {
            set({ error: 'Failed to delete product' });
            return false;
        }
    },

    uploadImage: async (productId: string, imageUri: string, isPrimary: boolean = false) => {
        set({ isLoading: true, error: null });
        try {
            const formData = new FormData();
            formData.append('image', {
                uri: imageUri,
                type: 'image/jpeg',
                name: 'product_image.jpg',
            } as any);
            formData.append('is_primary', isPrimary.toString());

            await api.post(`/products/${productId}/images/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // Refresh product to get updated images
            await get().fetchProduct(productId);
            set({ isLoading: false });
            return true;
        } catch (error: any) {
            set({ error: 'Failed to upload image', isLoading: false });
            return false;
        }
    },
}));
