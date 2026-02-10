/**
 * Options for constructing a GammaError.
 */
export interface GammaErrorOptions {
  code: string;
  statusCode?: number | undefined;
  requestId?: string | undefined;
  cause?: Error | undefined;
}

/**
 * Base error class for all Gamma SDK errors.
 */
export class GammaError extends Error {
  readonly code: string;
  readonly statusCode: number | undefined;
  readonly requestId: string | undefined;
  readonly cause: Error | undefined;

  constructor(message: string, options: GammaErrorOptions) {
    super(message);
    this.name = 'GammaError';
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.requestId = options.requestId;
    this.cause = options.cause;

    // Maintain proper stack trace in V8 environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Options for specific error constructors.
 */
export interface SpecificErrorOptions {
  requestId?: string | undefined;
  cause?: Error | undefined;
}

/**
 * Validation error - thrown when request validation fails (HTTP 400).
 */
export class ValidationError extends GammaError {
  override readonly statusCode = 400;

  constructor(message: string, options: SpecificErrorOptions = {}) {
    super(message, {
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      ...options,
    });
    this.name = 'ValidationError';
  }
}

/**
 * Authentication error - thrown when API key is invalid or missing (HTTP 401).
 */
export class AuthenticationError extends GammaError {
  override readonly statusCode = 401;

  constructor(message: string, options: SpecificErrorOptions = {}) {
    super(message, {
      code: 'AUTHENTICATION_ERROR',
      statusCode: 401,
      ...options,
    });
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error - thrown when user lacks credits or permissions (HTTP 403).
 */
export class AuthorizationError extends GammaError {
  override readonly statusCode = 403;

  constructor(message: string, options: SpecificErrorOptions = {}) {
    super(message, {
      code: 'AUTHORIZATION_ERROR',
      statusCode: 403,
      ...options,
    });
    this.name = 'AuthorizationError';
  }
}

/**
 * Not found error - thrown when a resource is not found (HTTP 404).
 */
export class NotFoundError extends GammaError {
  override readonly statusCode = 404;

  constructor(message: string, options: SpecificErrorOptions = {}) {
    super(message, {
      code: 'NOT_FOUND_ERROR',
      statusCode: 404,
      ...options,
    });
    this.name = 'NotFoundError';
  }
}

/**
 * Generation failed error - thrown when generation fails (HTTP 422).
 */
export class GenerationFailedError extends GammaError {
  override readonly statusCode = 422;

  constructor(message: string, options: SpecificErrorOptions = {}) {
    super(message, {
      code: 'GENERATION_FAILED_ERROR',
      statusCode: 422,
      ...options,
    });
    this.name = 'GenerationFailedError';
  }
}

/**
 * Options for rate limit error.
 */
export interface RateLimitErrorOptions extends SpecificErrorOptions {
  retryAfter?: number | undefined;
}

/**
 * Rate limit error - thrown when rate limit is exceeded (HTTP 429).
 */
export class RateLimitError extends GammaError {
  override readonly statusCode = 429;
  readonly retryAfter: number | undefined;

  constructor(message: string, options: RateLimitErrorOptions = {}) {
    super(message, {
      code: 'RATE_LIMIT_ERROR',
      statusCode: 429,
      requestId: options.requestId,
      cause: options.cause,
    });
    this.name = 'RateLimitError';
    this.retryAfter = options.retryAfter;
  }
}

/**
 * Server error - thrown when the server encounters an error (HTTP 500).
 */
export class ServerError extends GammaError {
  override readonly statusCode = 500;

  constructor(message: string, options: SpecificErrorOptions = {}) {
    super(message, {
      code: 'SERVER_ERROR',
      statusCode: 500,
      ...options,
    });
    this.name = 'ServerError';
  }
}

/**
 * Gateway error - thrown when the gateway encounters an error (HTTP 502).
 */
export class GatewayError extends GammaError {
  override readonly statusCode = 502;

  constructor(message: string, options: SpecificErrorOptions = {}) {
    super(message, {
      code: 'GATEWAY_ERROR',
      statusCode: 502,
      ...options,
    });
    this.name = 'GatewayError';
  }
}

/**
 * Options for polling errors.
 */
export interface PollingErrorOptions extends SpecificErrorOptions {
  generationId: string;
  elapsedMs: number;
  pollCount: number;
}

/**
 * Polling timeout error - thrown when polling exceeds the timeout limit.
 */
export class PollingTimeoutError extends GammaError {
  readonly generationId: string;
  readonly elapsedMs: number;
  readonly pollCount: number;

  constructor(message: string, options: PollingErrorOptions) {
    super(message, {
      code: 'POLLING_TIMEOUT_ERROR',
      requestId: options.requestId,
      cause: options.cause,
    });
    this.name = 'PollingTimeoutError';
    this.generationId = options.generationId;
    this.elapsedMs = options.elapsedMs;
    this.pollCount = options.pollCount;
  }
}

/**
 * Polling cancelled error - thrown when polling is cancelled via AbortSignal.
 */
export class PollingCancelledError extends GammaError {
  readonly generationId: string;
  readonly elapsedMs: number;
  readonly pollCount: number;

  constructor(message: string, options: PollingErrorOptions) {
    super(message, {
      code: 'POLLING_CANCELLED_ERROR',
      requestId: options.requestId,
      cause: options.cause,
    });
    this.name = 'PollingCancelledError';
    this.generationId = options.generationId;
    this.elapsedMs = options.elapsedMs;
    this.pollCount = options.pollCount;
  }
}

/**
 * Network error - thrown when a network error occurs.
 */
export class NetworkError extends GammaError {
  constructor(message: string, options: SpecificErrorOptions = {}) {
    super(message, {
      code: 'NETWORK_ERROR',
      ...options,
    });
    this.name = 'NetworkError';
  }
}

/**
 * Checks if an error is retryable (transient errors that may succeed on retry).
 * Retryable errors include rate limits, gateway errors, and network errors.
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof RateLimitError) {
    return true;
  }
  if (error instanceof GatewayError) {
    return true;
  }
  if (error instanceof NetworkError) {
    return true;
  }
  if (error instanceof ServerError) {
    return true;
  }
  return false;
}

/**
 * Error response body from the API.
 */
interface ApiErrorBody {
  error?: string;
  message?: string;
  code?: string;
}

/**
 * Parses an API error response and throws the appropriate error class.
 * This function always throws and never returns.
 */
export function parseApiError(
  statusCode: number,
  body: unknown,
  requestId?: string
): never {
  const errorBody = body as ApiErrorBody | undefined;
  const message =
    errorBody?.message ||
    errorBody?.error ||
    `Request failed with status ${statusCode}`;

  const options: SpecificErrorOptions = {};
  if (requestId !== undefined) {
    options.requestId = requestId;
  }

  switch (statusCode) {
    case 400:
      throw new ValidationError(message, options);
    case 401:
      throw new AuthenticationError(message, options);
    case 403:
      throw new AuthorizationError(message, options);
    case 404:
      throw new NotFoundError(message, options);
    case 422:
      throw new GenerationFailedError(message, options);
    case 429:
      throw new RateLimitError(message, options);
    case 500:
      throw new ServerError(message, options);
    case 502:
      throw new GatewayError(message, options);
    default:
      if (statusCode >= 500) {
        throw new ServerError(message, options);
      }
      throw new GammaError(message, {
        code: 'API_ERROR',
        statusCode,
        requestId,
      });
  }
}
