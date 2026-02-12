import { create } from 'zustand';
import api from '../services/api';

interface DashboardData {
    sales: {
        today: number;
        this_week: number;
        this_month: number;
    };
    alerts: {
        low_stock_count: number;
        out_of_stock_count: number;
    };
    credit: {
        pending_sales_count: number;
        total_outstanding_debt: number;
    };
    top_products_today: Array<{
        product__name: string;
        quantity_sold: number;
        revenue: number;
    }>;
}

interface DashboardState {
    data: DashboardData | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;

    fetchDashboard: () => Promise<void>;
    refresh: () => Promise<void>;
}

const initialData: DashboardData = {
    sales: { today: 0, this_week: 0, this_month: 0 },
    alerts: { low_stock_count: 0, out_of_stock_count: 0 },
    credit: { pending_sales_count: 0, total_outstanding_debt: 0 },
    top_products_today: [],
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
    data: null,
    isLoading: false,
    error: null,
    lastUpdated: null,

    fetchDashboard: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/reports/dashboard/');
            const data = response.data.data || response.data;
            set({
                data,
                isLoading: false,
                lastUpdated: new Date()
            });
        } catch (error: any) {
            set({
                data: initialData,
                error: 'Failed to load dashboard',
                isLoading: false
            });
        }
    },

    refresh: async () => {
        await get().fetchDashboard();
    },
}));
