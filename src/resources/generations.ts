/**
 * Gamma SDK - Generations Resource
 *
 * This module provides methods for creating and managing content generations.
 * Supports both immediate return and polling for completion.
 */

import { HttpClient } from '../utils/http.js';
import { pollForCompletion, type PollingOptions } from '../utils/polling.js';
import { ValidationError, GammaError } from '../errors/index.js';
import type {
  GenerateRequest,
  GenerateFromTemplateRequest,
  GenerationStartResponse,
  GenerationStatusResponse,
  GenerationCompletedResponse,
} from '../types/index.js';
import { isGenerationCompleted, isGenerationFailed } from '../types/index.js';

/**
 * Options for polling during generation.
 * Extends the base PollingOptions with generation-specific configurations.
 */
export interface GenerationPollingOptions extends PollingOptions {}

/**
 * Resource class for managing content generations.
 *
 * Provides methods to:
 * - Create new generations from text input
 * - Create generations from existing templates
 * - Check generation status
 * - Wait for generation completion with polling
 *
 * @example
 * ```typescript
 * // Create and wait for completion
 * const result = await client.generations.createAndWait({
 *   inputText: 'Five tips for productivity',
 *   textMode: 'generate',
 *   format: 'presentation',
 * });
 * console.log(result.gammaUrl);
 * ```
 */
export class GenerationsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Starts a new generation and returns immediately with the generation ID.
   * Use `getStatus()` or `waitForCompletion()` to check when the generation completes.
   *
   * @param request - The generation request configuration
   * @returns A promise resolving to the generation ID
   *
   * @example
   * ```typescript
   * const { generationId } = await client.generations.create({
   *   inputText: 'Five tips for productivity',
   *   textMode: 'generate',
   * });
   *
   * // Check status later
   * const status = await client.generations.getStatus(generationId);
   * ```
   */
  async create(request: GenerateRequest, signal?: AbortSignal): Promise<GenerationStartResponse> {
    return this.http.post<GenerationStartResponse>('/generations', request, signal);
  }

  /**
   * Starts a new generation from an existing template and returns immediately.
   * Use `getStatus()` or `waitForCompletion()` to check when the generation completes.
   *
   * Note: This endpoint is currently in beta. Functionality, rate limits,
   * and pricing are subject to change.
   *
   * @param request - The template-based generation request
   * @returns A promise resolving to the generation ID
   *
   * @example
   * ```typescript
   * const { generationId } = await client.generations.createFromTemplate({
   *   gammaId: 'g_abcdef123456',
   *   prompt: 'Create a quarterly report for Q4 2024',
   * });
   * ```
   */
  async createFromTemplate(
    request: GenerateFromTemplateRequest,
    signal?: AbortSignal
  ): Promise<GenerationStartResponse> {
    return this.http.post<GenerationStartResponse>(
      '/generations/from-template',
      request,
      signal
    );
  }

  /**
   * Checks the current status of a generation.
   *
   * @param generationId - The ID of the generation to check
   * @returns A promise resolving to the generation status
   *
   * @example
   * ```typescript
   * const status = await client.generations.getStatus(generationId);
   * if (status.status === 'completed') {
   *   console.log('Gamma URL:', status.gammaUrl);
   * } else {
   *   console.log('Still generating...');
   * }
   * ```
   */
  async getStatus(generationId: string): Promise<GenerationStatusResponse> {
    if (!generationId) {
      throw new ValidationError('generationId must be a non-empty string');
    }
    return this.http.get<GenerationStatusResponse>(
      `/generations/${encodeURIComponent(generationId)}`
    );
  }

  /**
   * Creates a new generation and polls until it completes.
   * This is a convenience method that combines `create()` and `waitForCompletion()`.
   *
   * @param request - The generation request configuration
   * @param options - Optional polling configuration
   * @returns A promise resolving to the completed generation response
   *
   * @throws {PollingTimeoutError} When polling exceeds the configured timeout
   * @throws {PollingCancelledError} When polling is cancelled via AbortSignal
   * @throws {GenerationFailedError} When the generation fails
   *
   * @example
   * ```typescript
   * // Basic usage
   * const result = await client.generations.createAndWait({
   *   inputText: 'Five tips for productivity',
   *   textMode: 'generate',
   * });
   * console.log(result.gammaUrl);
   *
   * // With progress callback
   * const result = await client.generations.createAndWait(
   *   { inputText: 'My content', textMode: 'generate' },
   *   {
   *     onProgress: (progress) => {
   *       console.log(`Poll #${progress.pollCount}: ${progress.status}`);
   *     },
   *   }
   * );
   *
   * // With cancellation support
   * const controller = new AbortController();
   * setTimeout(() => controller.abort(), 60000); // Cancel after 1 minute
   *
   * const result = await client.generations.createAndWait(
   *   { inputText: 'My content', textMode: 'generate' },
   *   { signal: controller.signal }
   * );
   * ```
   */
  async createAndWait(
    request: GenerateRequest,
    options?: GenerationPollingOptions
  ): Promise<GenerationCompletedResponse> {
    const { generationId } = await this.create(request, options?.signal);
    return this.waitForCompletion(generationId, options);
  }

  /**
   * Creates a new generation from a template and polls until it completes.
   * This is a convenience method that combines `createFromTemplate()` and `waitForCompletion()`.
   *
   * Note: This endpoint is currently in beta. Functionality, rate limits,
   * and pricing are subject to change.
   *
   * @param request - The template-based generation request
   * @param options - Optional polling configuration
   * @returns A promise resolving to the completed generation response
   *
   * @throws {PollingTimeoutError} When polling exceeds the configured timeout
   * @throws {PollingCancelledError} When polling is cancelled via AbortSignal
   * @throws {GenerationFailedError} When the generation fails
   *
   * @example
   * ```typescript
   * const result = await client.generations.createFromTemplateAndWait({
   *   gammaId: 'g_abcdef123456',
   *   prompt: 'Create a quarterly report for Q4 2024',
   * });
   * console.log(result.gammaUrl);
   * ```
   */
  async createFromTemplateAndWait(
    request: GenerateFromTemplateRequest,
    options?: GenerationPollingOptions
  ): Promise<GenerationCompletedResponse> {
    const { generationId } = await this.createFromTemplate(request, options?.signal);
    return this.waitForCompletion(generationId, options);
  }

  /**
   * Polls an existing generation until it completes.
   * Useful when you have a generation ID from a previous `create()` call.
   *
   * @param generationId - The ID of the generation to wait for
   * @param options - Optional polling configuration
   * @returns A promise resolving to the completed generation response
   *
   * @throws {PollingTimeoutError} When polling exceeds the configured timeout
   * @throws {PollingCancelledError} When polling is cancelled via AbortSignal
   * @throws {GenerationFailedError} When the generation fails
   *
   * @example
   * ```typescript
   * // Resume polling for a previously started generation
   * const result = await client.generations.waitForCompletion(generationId, {
   *   timeoutMs: 300000, // 5 minute timeout
   *   onProgress: (progress) => {
   *     console.log(`Elapsed: ${progress.elapsedMs}ms`);
   *   },
   * });
   * ```
   */
  async waitForCompletion(
    generationId: string,
    options?: GenerationPollingOptions
  ): Promise<GenerationCompletedResponse> {
    if (!generationId) {
      throw new ValidationError('generationId must be a non-empty string');
    }

    // Failure detector that extracts error message from failed responses
    const detectFailure = (response: GenerationStatusResponse): string | undefined => {
      if (isGenerationFailed(response)) {
        return response.error.message;
      }
      return undefined;
    };

    const result = await pollForCompletion<GenerationStatusResponse>(
      generationId,
      (id, signal) => this.http.get<GenerationStatusResponse>(
        `/generations/${encodeURIComponent(id)}`,
        signal
      ),
      isGenerationCompleted,
      options,
      detectFailure
    );

    // Use type guard for proper narrowing instead of an unsafe type assertion.
    // pollForCompletion guarantees the result passes isGenerationCompleted,
    // so this check is defensive but ensures type-safe narrowing.
    if (!isGenerationCompleted(result)) {
      throw new GammaError(
        `Unexpected: generation ${generationId} did not complete successfully`,
        { code: 'UNEXPECTED_STATE' }
      );
    }

    return result;
  }
}
