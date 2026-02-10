import {
  PollingTimeoutError,
  PollingCancelledError,
  GenerationFailedError,
  isRetryableError,
} from '../errors/index.js';

/**
 * Options for configuring polling behavior.
 */
export interface PollingOptions {
  /** Initial polling interval in milliseconds (default: 10000 - 10 seconds) */
  intervalMs?: number;
  /** Maximum time to wait for completion in milliseconds (default: 600000 - 10 minutes) */
  timeoutMs?: number;
  /** Maximum polling interval in milliseconds (default: 30000 - 30 seconds) */
  maxIntervalMs?: number;
  /** Multiplier for exponential backoff (default: 1.5) */
  backoffMultiplier?: number;
  /** Maximum consecutive errors to tolerate before failing (default: 3) */
  maxConsecutiveErrors?: number;
  /** AbortSignal for cancellation support */
  signal?: AbortSignal;
  /** Callback invoked after each poll with progress information */
  onProgress?: (progress: PollingProgress) => void;
}

/**
 * Progress information provided during polling.
 */
export interface PollingProgress {
  /** Current status from the API */
  status: 'pending' | 'completed' | 'failed';
  /** The generation ID being polled */
  generationId: string;
  /** Number of polls completed */
  pollCount: number;
  /** Elapsed time in milliseconds since polling started */
  elapsedMs: number;
  /** Current polling interval in milliseconds */
  currentIntervalMs: number;
}

/**
 * Default polling configuration values.
 */
const DEFAULT_INTERVAL_MS = 10_000; // 10 seconds
const DEFAULT_TIMEOUT_MS = 600_000; // 10 minutes
const DEFAULT_MAX_INTERVAL_MS = 30_000; // 30 seconds
const DEFAULT_BACKOFF_MULTIPLIER = 1.5;
const DEFAULT_MAX_CONSECUTIVE_ERRORS = 3;

/**
 * Failure detection function signature.
 * Returns an error message if the response indicates failure, or undefined if not failed.
 */
export type FailureDetector<T> = (response: T) => string | undefined;

/**
 * Polls for completion of an async operation with exponential backoff.
 *
 * @param generationId - The ID of the generation to poll for
 * @param fetchStatus - Function to fetch the current status
 * @param isComplete - Function to determine if the response indicates completion
 * @param options - Polling configuration options
 * @param isFailed - Optional function to detect if the generation has failed, returns error message if failed
 * @returns The final completed response
 * @throws {PollingTimeoutError} When the timeout is exceeded
 * @throws {PollingCancelledError} When cancelled via AbortSignal
 * @throws {GenerationFailedError} When the generation fails
 */
export async function pollForCompletion<T>(
  generationId: string,
  fetchStatus: (id: string, signal?: AbortSignal) => Promise<T>,
  isComplete: (response: T) => boolean,
  options?: PollingOptions,
  isFailed?: FailureDetector<T>
): Promise<T> {
  const intervalMs = options?.intervalMs ?? DEFAULT_INTERVAL_MS;
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxIntervalMs = options?.maxIntervalMs ?? DEFAULT_MAX_INTERVAL_MS;
  const backoffMultiplier = options?.backoffMultiplier ?? DEFAULT_BACKOFF_MULTIPLIER;
  const maxConsecutiveErrors =
    options?.maxConsecutiveErrors ?? DEFAULT_MAX_CONSECUTIVE_ERRORS;
  const signal = options?.signal;
  const onProgress = options?.onProgress;

  const startTime = Date.now();
  let pollCount = 0;
  let currentIntervalMs = intervalMs;
  let consecutiveErrors = 0;

  while (true) {
    // Check for timeout before polling
    const elapsedMs = Date.now() - startTime;
    if (elapsedMs >= timeoutMs) {
      throw new PollingTimeoutError(
        `Polling timed out after ${elapsedMs}ms (${pollCount} polls)`,
        {
          generationId,
          elapsedMs,
          pollCount,
        }
      );
    }

    // Check for cancellation before polling
    if (signal?.aborted) {
      throw new PollingCancelledError('Polling was cancelled', {
        generationId,
        elapsedMs,
        pollCount,
      });
    }

    try {
      // Fetch current status
      const response = await fetchStatus(generationId, signal);
      pollCount++;
      consecutiveErrors = 0; // Reset on successful poll

      // Check if failed
      if (isFailed) {
        const errorMessage = isFailed(response);
        if (errorMessage) {
          // Call progress callback with failed status
          if (onProgress) {
            const progress: PollingProgress = {
              status: 'failed',
              generationId,
              pollCount,
              elapsedMs: Date.now() - startTime,
              currentIntervalMs,
            };
            onProgress(progress);
          }
          throw new GenerationFailedError(errorMessage);
        }
      }

      // Check if complete
      if (isComplete(response)) {
        // Call progress callback with completed status
        if (onProgress) {
          const progress: PollingProgress = {
            status: 'completed',
            generationId,
            pollCount,
            elapsedMs: Date.now() - startTime,
            currentIntervalMs,
          };
          onProgress(progress);
        }
        return response;
      }

      // Call progress callback with pending status
      if (onProgress) {
        const progress: PollingProgress = {
          status: 'pending',
          generationId,
          pollCount,
          elapsedMs: Date.now() - startTime,
          currentIntervalMs,
        };
        onProgress(progress);
      }
    } catch (error) {
      pollCount++;

      // Check for cancellation
      if (signal?.aborted) {
        throw new PollingCancelledError('Polling was cancelled', {
          generationId,
          elapsedMs: Date.now() - startTime,
          pollCount,
          cause: error as Error,
        });
      }

      // Handle transient errors
      if (isRetryableError(error)) {
        consecutiveErrors++;
        if (consecutiveErrors >= maxConsecutiveErrors) {
          // Too many consecutive errors, re-throw the last one
          throw error;
        }
        // Continue to wait and retry
      } else {
        // Non-retryable error, throw immediately
        throw error;
      }
    }

    // Wait before next poll
    await sleep(currentIntervalMs, signal, generationId, pollCount, startTime);

    // Apply exponential backoff for next iteration
    currentIntervalMs = Math.min(
      currentIntervalMs * backoffMultiplier,
      maxIntervalMs
    );
  }
}

/**
 * Sleeps for the specified duration, respecting the abort signal.
 */
async function sleep(
  ms: number,
  signal: AbortSignal | undefined,
  generationId: string,
  pollCount: number,
  startTime: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(
        new PollingCancelledError('Polling was cancelled', {
          generationId,
          elapsedMs: Date.now() - startTime,
          pollCount,
        })
      );
      return;
    }

    const abortHandler = () => {
      clearTimeout(timeoutId);
      reject(
        new PollingCancelledError('Polling was cancelled', {
          generationId,
          elapsedMs: Date.now() - startTime,
          pollCount,
        })
      );
    };

    const timeoutId = setTimeout(() => {
      signal?.removeEventListener('abort', abortHandler);
      resolve();
    }, ms);

    signal?.addEventListener('abort', abortHandler, { once: true });

    // Re-check after adding listener to close the race window where
    // the signal could be aborted between the initial check and listener registration
    if (signal?.aborted) {
      clearTimeout(timeoutId);
      reject(
        new PollingCancelledError('Polling was cancelled', {
          generationId,
          elapsedMs: Date.now() - startTime,
          pollCount,
        })
      );
    }
  });
}
