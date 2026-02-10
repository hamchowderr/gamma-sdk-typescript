/**
 * Gamma SDK - Response Type Definitions
 *
 * This module contains types for API responses, including generation status,
 * themes, folders, and paginated results.
 */

import type { ThemeType } from './enums';

// =============================================================================
// Credit Information
// =============================================================================

/**
 * Credit usage and balance information.
 * Returned in generation status responses.
 */
export interface Credits {
  /**
   * Number of credits deducted for this generation.
   * Value is 0 if the generation is still pending or failed.
   */
  deducted: number;

  /**
   * Remaining credit balance after deduction.
   */
  remaining: number;
}

// =============================================================================
// Generation Responses
// =============================================================================

/**
 * Response from initiating a generation request.
 * Returned by POST /generations and POST /generations/from-template.
 */
export interface GenerationStartResponse {
  /**
   * Unique identifier for the generation request.
   * Use this ID to poll for status via GET /generations/{generationId}.
   */
  generationId: string;

  /**
   * Warnings about conflicting or ignored parameters.
   * Returned when the API detects issues with the request that don't prevent generation
   * but may result in unexpected output (e.g., incompatible dimensions for format).
   * @example "imageOptions.model and imageOptions.style are ignored when imageOptions.source is not aiGenerated."
   */
  warnings?: string;
}

/**
 * Generation status response when the generation is still in progress.
 */
export interface GenerationPendingResponse {
  /**
   * The generation ID.
   */
  generationId: string;

  /**
   * Status indicating the generation is still in progress.
   */
  status: 'pending';
}

/**
 * Generation status response when the generation has completed successfully.
 */
export interface GenerationCompletedResponse {
  /**
   * The generation ID.
   */
  generationId: string;

  /**
   * Status indicating the generation has completed.
   */
  status: 'completed';

  /**
   * URL to view the generated gamma in the Gamma app.
   * @example "https://gamma.app/docs/yyyyyyyyyy"
   */
  gammaUrl: string;

  /**
   * Credit usage information for this generation.
   */
  credits: Credits;

  /**
   * URL to download the PDF export.
   * Only present if `exportAs: 'pdf'` was specified in the request.
   * Note: This URL expires after a period of time.
   */
  pdfUrl?: string;

  /**
   * URL to download the PowerPoint export.
   * Only present if `exportAs: 'pptx'` was specified in the request.
   * Note: This URL expires after a period of time.
   */
  pptxUrl?: string;

  /**
   * Warnings about conflicting or ignored parameters.
   * Returned when the API detects issues with the request that don't prevent generation
   * but may result in unexpected output (e.g., incompatible dimensions for format).
   * @example "cardOptions.dimensions 1x1 is not valid for format presentation. Valid dimensions are: [ 16x9, 4x3, fluid ]. Using default: fluid."
   */
  warnings?: string;
}

/**
 * Error details returned when a generation fails.
 */
export interface GenerationError {
  /**
   * Human-readable error message describing what went wrong.
   */
  message: string;

  /**
   * HTTP status code associated with the error.
   */
  statusCode: number;
}

/**
 * Generation status response when the generation has failed.
 */
export interface GenerationFailedResponse {
  /**
   * The generation ID.
   */
  generationId: string;

  /**
   * Status indicating the generation has failed.
   */
  status: 'failed';

  /**
   * Error details explaining why the generation failed.
   */
  error: GenerationError;
}

/**
 * Union type for generation status responses.
 * Use type guards `isGenerationCompleted()`, `isGenerationPending()`, and `isGenerationFailed()`
 * to narrow the type.
 */
export type GenerationStatusResponse =
  | GenerationPendingResponse
  | GenerationCompletedResponse
  | GenerationFailedResponse;

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Type guard to check if a generation status response indicates completion.
 *
 * @param response - The generation status response to check
 * @returns True if the generation has completed successfully
 *
 * @example
 * ```typescript
 * const status = await client.generations.getStatus(generationId);
 * if (isGenerationCompleted(status)) {
 *   console.log('Gamma URL:', status.gammaUrl);
 *   console.log('Credits used:', status.credits.deducted);
 * }
 * ```
 */
export function isGenerationCompleted(
  response: GenerationStatusResponse
): response is GenerationCompletedResponse {
  return response.status === 'completed';
}

/**
 * Type guard to check if a generation status response indicates pending status.
 *
 * @param response - The generation status response to check
 * @returns True if the generation is still in progress
 *
 * @example
 * ```typescript
 * const status = await client.generations.getStatus(generationId);
 * if (isGenerationPending(status)) {
 *   console.log('Generation still in progress...');
 * }
 * ```
 */
export function isGenerationPending(
  response: GenerationStatusResponse
): response is GenerationPendingResponse {
  return response.status === 'pending';
}

/**
 * Type guard to check if a generation status response indicates failure.
 *
 * @param response - The generation status response to check
 * @returns True if the generation has failed
 *
 * @example
 * ```typescript
 * const status = await client.generations.getStatus(generationId);
 * if (isGenerationFailed(status)) {
 *   console.error('Generation failed:', status.error.message);
 * }
 * ```
 */
export function isGenerationFailed(
  response: GenerationStatusResponse
): response is GenerationFailedResponse {
  return response.status === 'failed';
}

// =============================================================================
// Theme and Folder Responses
// =============================================================================

/**
 * A theme that can be applied to generated gammas.
 */
export interface Theme {
  /**
   * Unique identifier for the theme.
   * Use this value as `themeId` in generation requests.
   */
  id: string;

  /**
   * Display name of the theme.
   */
  name: string;

  /**
   * Type of theme.
   * - `standard`: Global theme available to all users
   * - `custom`: Workspace-specific custom theme
   */
  type: ThemeType;

  /**
   * Keywords describing the theme's color palette.
   * Useful for filtering or searching themes by color.
   * @example ["light", "blue", "pink", "purple", "pastel", "gradient", "vibrant"]
   */
  colorKeywords: string[];

  /**
   * Keywords describing the theme's tone/mood.
   * Useful for filtering or searching themes by style.
   * @example ["playful", "friendly", "creative", "inspirational", "fun"]
   */
  toneKeywords: string[];
}

/**
 * A folder for organizing gammas.
 */
export interface Folder {
  /**
   * Unique identifier for the folder.
   * Use this value in `folderIds` in generation requests.
   */
  id: string;

  /**
   * Display name of the folder.
   */
  name: string;
}

// =============================================================================
// Pagination
// =============================================================================

/**
 * A paginated response containing a list of items.
 * Used by GET /themes and GET /folders endpoints.
 *
 * @typeParam T - The type of items in the data array (Theme or Folder)
 */
export interface PaginatedResponse<T> {
  /**
   * Array of items for the current page.
   */
  data: T[];

  /**
   * Indicates whether more items are available.
   * If true, use `nextCursor` to fetch the next page.
   */
  hasMore: boolean;

  /**
   * Cursor token for fetching the next page.
   * Pass this value as the `after` parameter in the next request.
   * Will be `null` when there are no more pages.
   */
  nextCursor: string | null;
}

// =============================================================================
// Error Response
// =============================================================================

/**
 * Standard error response from the API.
 */
export interface ErrorResponse {
  /**
   * Human-readable error message describing what went wrong.
   */
  message: string;

  /**
   * HTTP status code of the error.
   */
  statusCode: number;

  /**
   * Credit information (included in some error responses).
   */
  credits?: Credits;
}
