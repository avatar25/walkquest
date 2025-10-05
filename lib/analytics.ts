import * as Sentry from 'sentry-expo';
import { config } from './config';

let initialized = false;

export function initAnalytics() {
  if (initialized) return;
  if (!config.sentryDsn) {
    if (__DEV__) {
      console.info('Sentry DSN not configured. Analytics will log to console only.');
    }
    return;
  }
  Sentry.init({
    dsn: config.sentryDsn,
    enableNative: true,
    enableInExpoDevelopment: true,
    debug: __DEV__,
    tracesSampleRate: 0.2,
  });
  initialized = true;
}

export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (!initialized) {
    console.error('captureError', error, context);
    return;
  }
  Sentry.Native.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value as any);
      });
    }
    Sentry.Native.captureException(error);
  });
}

export function trackEvent(name: string, properties?: Record<string, unknown>) {
  if (!initialized) {
    console.info(`event:${name}`, properties ?? {});
    return;
  }
  Sentry.Native.withScope((scope) => {
    scope.setTag('event', name);
    if (properties) {
      Object.entries(properties).forEach(([key, value]) => scope.setExtra(key, value as any));
    }
    Sentry.Native.captureMessage(name, 'info');
  });
}
