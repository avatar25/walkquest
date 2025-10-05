import Constants from 'expo-constants';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { FeatureFlagToggle } from './api';
import { apiClient } from './api';
import { config } from './config';

export interface FeatureFlagsContextValue {
  flags: Record<string, FeatureFlagToggle>;
  loading: boolean;
  refresh: () => Promise<void>;
  isEnabled: (key: string, fallback?: boolean) => boolean;
  getFlag: (key: string) => FeatureFlagToggle | undefined;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextValue | undefined>(undefined);

type FeatureFlagDefaults = Record<string, { enabled: boolean; payload?: Record<string, unknown> }>;

const defaultFlags: FeatureFlagDefaults = (Constants.expoConfig?.extra?.DEFAULT_FEATURE_FLAGS ?? {}) as FeatureFlagDefaults;

async function fetchRemoteFlags(): Promise<FeatureFlagToggle[]> {
  try {
    return await apiClient.request<FeatureFlagToggle[]>('/feature-flags', {
      method: 'GET',
      retries: 2,
      timeoutMs: config.defaultTimeoutMs,
      auth: true,
    });
  } catch (error) {
    console.warn('Failed to refresh feature flags. Using cached defaults.', error);
    return [];
  }
}

export function FeatureFlagProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlags] = useState<Record<string, FeatureFlagToggle>>(() => {
    const seeded: Record<string, FeatureFlagToggle> = {};
    Object.entries(defaultFlags).forEach(([key, value]) => {
      seeded[key] = {
        key,
        enabled: value.enabled,
        payload: value.payload,
        updatedAt: new Date().toISOString(),
      };
    });
    return seeded;
  });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await fetchRemoteFlags();
    if (result.length > 0) {
      setFlags((prev) => {
        const next = { ...prev };
        result.forEach((flag) => {
          next[flag.key] = flag;
        });
        return next;
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, config.featureFlagRefreshIntervalMs);
    return () => clearInterval(interval);
  }, [refresh]);

  const value = useMemo<FeatureFlagsContextValue>(() => ({
    flags,
    loading,
    refresh,
    isEnabled: (key: string, fallback = false) => flags[key]?.enabled ?? fallback,
    getFlag: (key: string) => flags[key],
  }), [flags, loading, refresh]);

  return <FeatureFlagsContext.Provider value={value}>{children}</FeatureFlagsContext.Provider>;
}

export function useFeatureFlags(): FeatureFlagsContextValue {
  const ctx = useContext(FeatureFlagsContext);
  if (!ctx) throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  return ctx;
}

export function useFeatureFlag(key: string, fallback = false): boolean {
  return useFeatureFlags().isEnabled(key, fallback);
}
