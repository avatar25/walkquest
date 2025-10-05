import { config } from '../config';
import type { ApiErrorBody, HttpMethod } from './types';

export class ApiError extends Error {
  readonly status: number;
  readonly body?: ApiErrorBody | string;

  constructor(message: string, status: number, body?: ApiErrorBody | string) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

type HeaderMap = Record<string, string>;

type QueryValue = string | number | boolean | undefined | null;

type RetryDecider = (error: unknown, attempt: number) => boolean;

export interface RequestOptions<TBody = unknown> {
  method?: HttpMethod;
  body?: TBody;
  headers?: HeaderMap;
  query?: Record<string, QueryValue>;
  retries?: number;
  auth?: boolean;
  timeoutMs?: number;
  signal?: AbortSignal;
}

type TokenFetcher = () => Promise<string | null>;

const DEFAULT_RETRIES = 2;
const BACKOFF_BASE_MS = 400;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildQueryString(query?: Record<string, QueryValue>): string {
  if (!query) return '';
  const searchParams = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    searchParams.append(key, String(value));
  });
  const qs = searchParams.toString();
  return qs.length > 0 ? `?${qs}` : '';
}

function shouldRetry(error: unknown, _attempt: number): boolean {
  if (error instanceof ApiError) {
    if (error.status >= 500 || error.status === 429) {
      return true;
    }
    return false;
  }
  return true;
}

async function parseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  if (contentType.startsWith('text/')) {
    return response.text();
  }
  return response.arrayBuffer();
}

export class ApiClient {
  private readonly baseUrl: string;
  private getToken?: TokenFetcher;
  private readonly retryDecider: RetryDecider;

  constructor({ baseUrl, getToken, retryDecider }: { baseUrl?: string; getToken?: TokenFetcher; retryDecider?: RetryDecider }) {
    const resolved = baseUrl ?? config.apiBaseUrl;
    if (!resolved) {
      throw new Error('API base URL is not configured. Set API_BASE_URL in app config or environment.');
    }
    this.baseUrl = resolved.replace(/\/$/, '');
    this.getToken = getToken;
    this.retryDecider = retryDecider ?? shouldRetry;
  }

  setTokenFetcher(fetcher?: TokenFetcher) {
    this.getToken = fetcher;
  }

  async request<TResponse, TBody = undefined>(endpoint: string, options: RequestOptions<TBody> = {}): Promise<TResponse> {
    const method = options.method ?? 'GET';
    const retries = options.retries ?? DEFAULT_RETRIES;
    const timeoutMs = options.timeoutMs ?? config.defaultTimeoutMs;
    const query = buildQueryString(options.query);
    const url = `${this.baseUrl}${endpoint}${query}`;

    const attemptFetch = async (attempt: number): Promise<TResponse> => {
      const controller = new AbortController();
      if (options.signal) {
        if (options.signal.aborted) {
          controller.abort();
        } else {
          options.signal.addEventListener('abort', () => controller.abort(), { once: true });
        }
      }
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const headers: HeaderMap = {
          Accept: 'application/json',
          ...(options.headers ?? {}),
        };
        if (options.auth && this.getToken) {
          const token = await this.getToken();
          if (token) {
            headers.Authorization = `Bearer ${token}`;
          }
        }
        let body: BodyInit | undefined;
        if (options.body !== undefined && options.body !== null) {
          if (typeof options.body === 'string' || options.body instanceof FormData) {
            body = options.body as BodyInit;
          } else {
            headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';
            body = JSON.stringify(options.body);
          }
        }
        const response = await fetch(url, {
          method,
          headers,
          body,
          signal: controller.signal,
        });
        const parsed = await parseBody(response);
        if (!response.ok) {
          const message = response.statusText || 'Request failed';
          throw new ApiError(message, response.status, parsed as ApiErrorBody | string);
        }
        return parsed as TResponse;
      } catch (error) {
        const canRetry = attempt < retries && this.retryDecider(error, attempt);
        if (canRetry) {
          const delay = BACKOFF_BASE_MS * 2 ** attempt + Math.random() * 100;
          await sleep(delay);
          return attemptFetch(attempt + 1);
        }
        throw error;
      } finally {
        clearTimeout(timeout);
      }
    };

    return attemptFetch(0);
  }
}

export const apiClient = new ApiClient({
  baseUrl: config.apiBaseUrl,
  getToken: async () => null,
});
