import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Platform-aware secure storage
 * Uses SecureStore on native, AsyncStorage on web
 */
class Storage {
    private isWeb = Platform.OS === 'web';

    async getItem(key: string): Promise<string | null> {
        if (this.isWeb) {
            return AsyncStorage.getItem(key);
        }
        return SecureStore.getItemAsync(key);
    }

    async setItem(key: string, value: string): Promise<void> {
        if (this.isWeb) {
            await AsyncStorage.setItem(key, value);
        } else {
            await SecureStore.setItemAsync(key, value);
        }
    }

    async removeItem(key: string): Promise<void> {
        if (this.isWeb) {
            await AsyncStorage.removeItem(key);
        } else {
            await SecureStore.deleteItemAsync(key);
        }
    }

    async clear(keys: string[]): Promise<void> {
        await Promise.all(keys.map((key) => this.removeItem(key)));
    }
}

export const storage = new Storage();
