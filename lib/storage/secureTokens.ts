import * as SecureStore from 'expo-secure-store';
import type { AuthTokens } from '../api';

const TOKEN_KEY = 'walkquest::authTokens';

export async function saveAuthTokens(tokens: AuthTokens): Promise<void> {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(tokens), {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    });
  } catch (error) {
    console.warn('Failed to persist auth tokens', error);
  }
}

export async function loadAuthTokens(): Promise<AuthTokens | null> {
  try {
    const stored = await SecureStore.getItemAsync(TOKEN_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as AuthTokens;
    return parsed;
  } catch (error) {
    console.warn('Failed to load auth tokens', error);
    return null;
  }
}

export async function clearAuthTokens(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.warn('Failed to clear auth tokens', error);
  }
}
