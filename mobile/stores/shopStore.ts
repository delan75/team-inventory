import { create } from 'zustand';
import api, { tokenStorage } from '../services/api';

interface Shop {
    id: string;
    name: string;
    currency: string;
    address?: string;
}

interface ShopState {
    shops: Shop[];
    activeShop: Shop | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchShops: () => Promise<void>;
    setActiveShop: (shop: Shop) => Promise<void>;
    createShop: (name: string, currency?: string) => Promise<boolean>;
}

export const useShopStore = create<ShopState>((set, get) => ({
    shops: [],
    activeShop: null,
    isLoading: false,
    error: null,

    fetchShops: async (): Promise<void> => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/shops/');
            const shops = response.data.data || response.data;
            set({ shops, isLoading: false });

            // Auto-select first shop if none selected
            if (shops.length > 0 && !get().activeShop) {
                await get().setActiveShop(shops[0]);
            }
        } catch (error: any) {
            set({ error: 'Failed to load shops', isLoading: false });
        }
    },

    setActiveShop: async (shop: Shop): Promise<void> => {
        await tokenStorage.setShopId(shop.id);
        set({ activeShop: shop });
    },

    createShop: async (name: string, currency: string = 'ZAR'): Promise<boolean> => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/shops/', { name, currency });
            const newShop = response.data.data || response.data;

            set((state) => ({
                shops: [...state.shops, newShop],
                activeShop: newShop,
                isLoading: false,
            }));

            await tokenStorage.setShopId(newShop.id);
            return true;
        } catch (error: any) {
            set({ error: 'Failed to create shop', isLoading: false });
            return false;
        }
    },
}));
