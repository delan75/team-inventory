import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storage } from '../utils/storage';

// API Base URL - change for production
const BASE_URL = __DEV__
    ? 'http://10.0.2.2:8000/api/v1' // Android emulator
    : 'http://localhost:8000/api/v1';

// For physical device testing, use your computer's IP
// const BASE_URL = 'http://192.168.1.x:8000/api/v1';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const SHOP_ID_KEY = 'active_shop_id';

// Token helpers
export const tokenStorage = {
    async getAccessToken(): Promise<string | null> {
        return storage.getItem(ACCESS_TOKEN_KEY);
    },
    async setAccessToken(token: string): Promise<void> {
        await storage.setItem(ACCESS_TOKEN_KEY, token);
    },
    async getRefreshToken(): Promise<string | null> {
        return storage.getItem(REFRESH_TOKEN_KEY);
    },
    async setRefreshToken(token: string): Promise<void> {
        await storage.setItem(REFRESH_TOKEN_KEY, token);
    },
    async getShopId(): Promise<string | null> {
        return storage.getItem(SHOP_ID_KEY);
    },
    async setShopId(shopId: string): Promise<void> {
        await storage.setItem(SHOP_ID_KEY, shopId);
    },
    async clearAll(): Promise<void> {
        await storage.clear([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, SHOP_ID_KEY]);
    },
};

// Request interceptor - attach token and shop ID
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = await tokenStorage.getAccessToken();
        const shopId = await tokenStorage.getShopId();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (shopId) {
            config.headers['X-Shop-ID'] = shopId;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = await tokenStorage.getRefreshToken();
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                const response = await axios.post(`${BASE_URL}/auth/refresh/`, {
                    refresh: refreshToken,
                });

                const { access } = response.data;
                await tokenStorage.setAccessToken(access);

                processQueue(null, access);
                originalRequest.headers.Authorization = `Bearer ${access}`;

                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError as Error, null);
                await tokenStorage.clearAll();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
