import * as Apple from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { supabase } from './supabase';
import { captureError, trackEvent } from './analytics';

export async function signInWithApple() {
  try {
    trackEvent('auth_apple_start');
    const nonce = Crypto.randomUUID();
    const resp = await Apple.signInAsync({
      requestedScopes: [Apple.AppleAuthenticationScope.FULL_NAME, Apple.AppleAuthenticationScope.EMAIL],
    });
    if (!resp.identityToken) {
      throw new Error('No Apple identity token');
    }
    await supabase.auth.signInWithIdToken({ provider: 'apple', token: resp.identityToken, nonce });
    trackEvent('auth_apple_success');
  } catch (error) {
    captureError(error, { provider: 'apple' });
    trackEvent('auth_apple_failure');
    throw error;
  }
}
