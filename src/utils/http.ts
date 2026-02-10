import {
  GammaError,
  NetworkError,
  RateLimitError,
  ValidationError,
  isRetryableError,
  parseApiError,
} from '../errors/index.js';

/**
 * Configuration options for the HTTP client.
 */
export interface HttpClientConfig {
  /** Base URL for the API (e.g., 'https://public-api.gamma.app/v1.0') */
  baseUrl: string;
  /** API key for authentication */
  apiKey: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Number of retries for transient errors (default: 3) */
  retries?: number;
}

/**
 * Default configuration values.
 */
const DEFAULT_TIMEOUT = 30_000;
const DEFAULT_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 30_000;
const RETRY_BACKOFF_MULTIPLIER = 2;

/**
 * HTTP client for making requests to the Gamma API.
 * Uses native fetch with retry logic and proper error handling.
 */
export class HttpClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeout: number;
  private readonly retries: number;

  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = config.apiKey;
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT;
    this.retries = config.retries ?? DEFAULT_RETRIES;
  }

  /**
   * Makes a GET request to the specified path.
   */
  async get<T>(path: string, signal?: AbortSignal): Promise<T> {
    return this.request<T>('GET', path, undefined, signal);
  }

  /**
   * Makes a POST request to the specified path with an optional body.
   */
  async post<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
    return this.request<T>('POST', path, body, signal);
  }

  /**
   * Internal method to make HTTP requests with retry logic.
   */
  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    signal?: AbortSignal
  ): Promise<T> {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

    let lastError: Error | undefined;
    let retryDelay = INITIAL_RETRY_DELAY;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      // Check if already aborted before making request
      if (signal?.aborted) {
        throw new NetworkError('Request was cancelled', {
          cause: signal.reason,
        });
      }

      try {
        const response = await this.makeRequest(method, url, body, signal);
        return response as T;
      } catch (error) {
        lastError = error as Error;

        // Don't retry if the request was cancelled
        if (signal?.aborted) {
          throw new NetworkError('Request was cancelled', {
            cause: error as Error,
          });
        }

        // Check if we should retry
        const shouldRetry =
          attempt < this.retries && isRetryableError(error);

        if (!shouldRetry) {
          throw error;
        }

        // Calculate delay for retry
        let delay = retryDelay;

        // Use retry-after header if available for rate limit errors
        if (error instanceof RateLimitError && error.retryAfter) {
          delay = error.retryAfter * 1000;
        }

        // Wait before retrying
        await this.sleep(delay, signal);

        // Increase delay for next retry with exponential backoff
        retryDelay = Math.min(
          retryDelay * RETRY_BACKOFF_MULTIPLIER,
          MAX_RETRY_DELAY
        );
      }
    }

    // Should not reach here, but throw the last error if we do
    throw lastError ?? new GammaError('Request failed after retries', {
      code: 'UNKNOWN_ERROR',
    });
  }

  /**
   * Makes a single HTTP request without retry logic.
   */
  private async makeRequest(
    method: string,
    url: string,
    body?: unknown,
    signal?: AbortSignal
  ): Promise<unknown> {
    // Create an abort controller for timeout
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), this.timeout);

    // Combine external signal with timeout signal
    const combined = signal
      ? this.combineSignals(signal, timeoutController.signal)
      : undefined;
    const combinedSignal = combined?.signal ?? timeoutController.signal;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-API-KEY': this.apiKey,
      };

      const fetchOptions: RequestInit = {
        method,
        headers,
        signal: combinedSignal,
      };

      if (body !== undefined) {
        try {
          fetchOptions.body = JSON.stringify(body);
        } catch (error) {
          throw new ValidationError(
            `Request body is not serializable: ${(error as Error).message}`
          );
        }
      }

      let response: Response;
      try {
        response = await fetch(url, fetchOptions);
      } catch (error) {
        // Handle fetch errors (network issues, timeouts, etc.)
        if ((error as Error).name === 'AbortError') {
          if (timeoutController.signal.aborted) {
            throw new NetworkError(`Request timed out after ${this.timeout}ms`);
          }
          throw new NetworkError('Request was cancelled', {
            cause: error as Error,
          });
        }
        throw new NetworkError('Network request failed', {
          cause: error as Error,
        });
      }

      // Get request ID from response headers
      const requestId =
        response.headers.get('x-request-id') ?? undefined;

      // Parse response body
      let responseBody: unknown;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        try {
          responseBody = await response.json();
        } catch {
          responseBody = undefined;
        }
      } else {
        responseBody = await response.text();
      }

      // Handle error responses
      if (!response.ok) {
        // Special handling for rate limit errors - extract retry-after header
        if (response.status === 429) {
          const retryAfterHeader = response.headers.get('retry-after');
          const retryAfterParsed = retryAfterHeader
            ? parseInt(retryAfterHeader, 10)
            : undefined;
          const retryAfter =
            retryAfterParsed !== undefined && !isNaN(retryAfterParsed)
              ? retryAfterParsed
              : undefined;

          const rateLimitOptions: import('../errors/index.js').RateLimitErrorOptions =
            {};
          if (requestId !== undefined) {
            rateLimitOptions.requestId = requestId;
          }
          if (retryAfter !== undefined) {
            rateLimitOptions.retryAfter = retryAfter;
          }

          throw new RateLimitError(
            (responseBody as { message?: string })?.message ||
              'Rate limit exceeded',
            rateLimitOptions
          );
        }

        parseApiError(response.status, responseBody, requestId);
      }

      return responseBody;
    } finally {
      clearTimeout(timeoutId);
      combined?.cleanup();
    }
  }

  /**
   * Combines multiple abort signals into one.
   * Returns the combined signal and a cleanup function to remove listeners.
   */
  private combineSignals(
    signal1: AbortSignal,
    signal2: AbortSignal
  ): { signal: AbortSignal; cleanup: () => void } {
    const controller = new AbortController();

    const abort = () => controller.abort();

    signal1.addEventListener('abort', abort);
    signal2.addEventListener('abort', abort);

    // If either signal is already aborted, abort immediately
    if (signal1.aborted || signal2.aborted) {
      controller.abort();
    }

    const cleanup = () => {
      signal1.removeEventListener('abort', abort);
      signal2.removeEventListener('abort', abort);
    };

    return { signal: controller.signal, cleanup };
  }

  /**
   * Sleeps for the specified duration, respecting the abort signal.
   */
  private async sleep(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(new NetworkError('Request was cancelled'));
        return;
      }

      const timeoutId = setTimeout(resolve, ms);

      signal?.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        reject(new NetworkError('Request was cancelled'));
      });
    });
  }
}
