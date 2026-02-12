import { create } from 'zustand';
import api from '../services/api';
import { Product } from './productsStore';

export interface CartItem {
    product: Product;
    quantity: number;
    price: number;
}

interface POSState {
    cart: CartItem[];
    selectedCustomerId: string | null;
    paymentMethod: 'CASH' | 'CARD' | 'EFT' | 'CREDIT';
    isProcessing: boolean;
    error: string | null;

    // Computed
    getTotal: () => number;
    getItemCount: () => number;

    // Actions
    addToCart: (product: Product, quantity?: number) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    setCustomer: (customerId: string | null) => void;
    setPaymentMethod: (method: 'CASH' | 'CARD' | 'EFT' | 'CREDIT') => void;
    processSale: (amountPaid: number) => Promise<boolean>;
}

export const usePOSStore = create<POSState>((set, get) => ({
    cart: [],
    selectedCustomerId: null,
    paymentMethod: 'CASH',
    isProcessing: false,
    error: null,

    getTotal: () => {
        return get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },

    getItemCount: () => {
        return get().cart.reduce((sum, item) => sum + item.quantity, 0);
    },

    addToCart: (product: Product, quantity: number = 1) => {
        set((state) => {
            const existing = state.cart.find((item) => item.product.id === product.id);
            if (existing) {
                return {
                    cart: state.cart.map((item) =>
                        item.product.id === product.id
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    ),
                };
            }
            return {
                cart: [...state.cart, { product, quantity, price: product.unit_price }],
            };
        });
    },

    updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
            get().removeFromCart(productId);
            return;
        }
        set((state) => ({
            cart: state.cart.map((item) =>
                item.product.id === productId ? { ...item, quantity } : item
            ),
        }));
    },

    removeFromCart: (productId: string) => {
        set((state) => ({
            cart: state.cart.filter((item) => item.product.id !== productId),
        }));
    },

    clearCart: () => {
        set({ cart: [], selectedCustomerId: null, paymentMethod: 'CASH' });
    },

    setCustomer: (customerId: string | null) => {
        set({ selectedCustomerId: customerId });
    },

    setPaymentMethod: (method) => {
        set({ paymentMethod: method });
    },

    processSale: async (amountPaid: number) => {
        const state = get();

        if (state.cart.length === 0) {
            set({ error: 'Cart is empty' });
            return false;
        }

        if (state.paymentMethod === 'CREDIT' && !state.selectedCustomerId) {
            set({ error: 'Customer required for credit sale' });
            return false;
        }

        set({ isProcessing: true, error: null });

        try {
            const saleData = {
                items: state.cart.map((item) => ({
                    product_id: item.product.id,
                    quantity: item.quantity,
                    price: item.price,
                })),
                payment: {
                    amount_paid: amountPaid,
                    method: state.paymentMethod,
                },
                customer_id: state.selectedCustomerId,
            };

            await api.post('/sales/', saleData);
            get().clearCart();
            set({ isProcessing: false });
            return true;
        } catch (error: any) {
            const message = error.response?.data?.detail || 'Failed to process sale';
            set({ error: message, isProcessing: false });
            return false;
        }
    },
}));
