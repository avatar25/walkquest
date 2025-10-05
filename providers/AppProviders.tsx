import { PropsWithChildren, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FeatureFlagProvider } from '../lib/feature-flags';
import { initAnalytics } from '../lib/analytics';
import { apiClient } from '../lib/api';
import { clearAuthTokens, loadAuthTokens, saveAuthTokens } from '../lib/storage/secureTokens';
import { supabase } from '../lib/supabase';

async function persistSessionTokens() {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (!session) {
    await clearAuthTokens();
    return;
  }
  if (!session.access_token) return;
  const expiresAt = session.expires_at ? new Date(session.expires_at * 1000).toISOString() : new Date(Date.now() + 3600 * 1000).toISOString();
  await saveAuthTokens({
    accessToken: session.access_token,
    refreshToken: session.refresh_token ?? '',
    expiresAt,
  });
}

export function AppProviders({ children }: PropsWithChildren) {
  useEffect(() => {
    initAnalytics();
    apiClient.setTokenFetcher(async () => {
      const tokens = await loadAuthTokens();
      if (!tokens) return null;
      const expires = new Date(tokens.expiresAt).getTime();
      if (Number.isFinite(expires) && expires < Date.now()) {
        return null;
      }
      return tokens.accessToken;
    });
    persistSessionTokens().catch(console.warn);
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        clearAuthTokens().catch(console.warn);
      } else if (session.access_token) {
        const expiresAt = session.expires_at ? new Date(session.expires_at * 1000).toISOString() : new Date(Date.now() + 3600 * 1000).toISOString();
        saveAuthTokens({
          accessToken: session.access_token,
          refreshToken: session.refresh_token ?? '',
          expiresAt,
        }).catch(console.warn);
      }
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <FeatureFlagProvider>{children}</FeatureFlagProvider>
    </SafeAreaProvider>
  );
}
