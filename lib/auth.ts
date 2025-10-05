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

export async function sendEmailOtp(email: string) {
  try {
    trackEvent('auth_email_otp_send');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) {
      throw error;
    }
  } catch (error) {
    captureError(error, { provider: 'email_otp' });
    trackEvent('auth_email_otp_send_failure');
    throw error;
  }
}

export async function verifyEmailOtp(email: string, token: string) {
  try {
    trackEvent('auth_email_otp_verify');
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    if (error) {
      throw error;
    }
    trackEvent('auth_email_otp_success');
  } catch (error) {
    captureError(error, { provider: 'email_otp' });
    trackEvent('auth_email_otp_verify_failure');
    throw error;
  }
}
