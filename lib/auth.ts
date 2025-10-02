import * as Apple from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { supabase } from './supabase';

export async function signInWithApple() {
  const nonce = Crypto.randomUUID();
  const resp = await Apple.signInAsync({
    requestedScopes: [Apple.AppleAuthenticationScope.FULL_NAME, Apple.AppleAuthenticationScope.EMAIL]
  });
  if (!resp.identityToken) throw new Error('No Apple identity token');
  await supabase.auth.signInWithIdToken({ provider: 'apple', token: resp.identityToken, nonce });
}
