import Constants from 'expo-constants';

type Maybe<T> = T | undefined | null;

type RawConfig = {
  API_BASE_URL?: string;
  API_TIMEOUT_MS?: number | string;
  FEATURE_FLAG_REFRESH_MS?: number | string;
  SENTRY_DSN?: string;
};

const extra: RawConfig = (Constants.expoConfig?.extra ?? {}) as RawConfig;

function readEnv(key: keyof RawConfig): string | undefined {
  const direct = extra[key];
  if (direct !== undefined && direct !== null && `${direct}`.length > 0) {
    return `${direct}`;
  }
  const env = process.env[key];
  if (env !== undefined && env !== null && `${env}`.length > 0) {
    return `${env}`;
  }
  return undefined;
}

function readNumber(key: keyof RawConfig, fallback: number): number {
  const value = readEnv(key);
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export interface AppConfig {
  apiBaseUrl?: string;
  defaultTimeoutMs: number;
  featureFlagRefreshIntervalMs: number;
  sentryDsn?: string;
}

export const config: AppConfig = {
  apiBaseUrl: readEnv('API_BASE_URL'),
  defaultTimeoutMs: readNumber('API_TIMEOUT_MS', 15000),
  featureFlagRefreshIntervalMs: readNumber('FEATURE_FLAG_REFRESH_MS', 5 * 60 * 1000),
  sentryDsn: readEnv('SENTRY_DSN'),
};

export function requireConfigValue<K extends keyof AppConfig>(key: K): NonNullable<AppConfig[K]> {
  const value = config[key];
  if (value === undefined || value === null || value === '') {
    throw new Error(`Missing configuration value for ${String(key)}. Set it via app.json extra or process environment.`);
  }
  return value as NonNullable<AppConfig[K]>;
}

export function withDefaultApiBaseUrl(url: Maybe<string>): string {
  if (url && url.length > 0) return url;
  const inferred = config.apiBaseUrl;
  if (!inferred || inferred.length === 0) {
    throw new Error('API base URL is not configured. Provide API_BASE_URL in app.json extra or environment.');
  }
  return inferred;
}
