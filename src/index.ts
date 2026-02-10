/**
 * Gamma SDK for TypeScript
 *
 * A TypeScript SDK for the Gamma API that provides:
 * - Type-safe API client with full TypeScript support
 * - Async generation with polling, cancellation, and progress callbacks
 * - Cursor-based pagination helpers for themes and folders
 * - Comprehensive error handling with custom error classes
 *
 * @example
 * ```typescript
 * import { GammaClient } from 'gamma-sdk';
 *
 * const client = new GammaClient({
 *   apiKey: 'sk-gamma-your-api-key',
 * });
 *
 * // Create a presentation
 * const result = await client.generations.createAndWait({
 *   inputText: 'Five tips for productivity',
 *   textMode: 'generate',
 *   format: 'presentation',
 * });
 *
 * console.log('Generated gamma:', result.gammaUrl);
 * ```
 *
 * @packageDocumentation
 */

// =============================================================================
// Client
// =============================================================================

export { GammaClient, createGammaClient } from './client.js';
export type { GammaClientConfig } from './client.js';

// =============================================================================
// Resources
// =============================================================================

export {
  GenerationsResource,
  ThemesResource,
  FoldersResource,
} from './resources/index.js';

export type {
  GenerationPollingOptions,
  ListThemesOptions,
  ListFoldersOptions,
} from './resources/index.js';

// =============================================================================
// Builder
// =============================================================================

export { GammaRequest, GammaTemplateRequest } from './builder/index.js';

// =============================================================================
// Types - Enums (String Literal Unions)
// =============================================================================

export type {
  // Text processing
  TextMode,
  TextAmount,
  // Output formats
  Format,
  CardSplit,
  ExportFormat,
  // Dimensions
  PresentationDimension,
  DocumentDimension,
  SocialDimension,
  Dimension,
  // Image options
  ImageSource,
  ImageModel,
  // Access control
  WorkspaceAccess,
  ExternalAccess,
  EmailAccess,
  // Header/footer
  HeaderFooterElementType,
  HeaderFooterImageSource,
  HeaderFooterImageSize,
  HeaderFooterPosition,
  // Theme and status
  ThemeType,
  GenerationStatus,
} from './types/index.js';

// =============================================================================
// Types - Language Codes
// =============================================================================

export type { LanguageCode } from './types/index.js';
export { LANGUAGE_NAMES } from './types/index.js';

// =============================================================================
// Types - Option Interfaces
// =============================================================================

export type {
  // Text and image options
  TextOptions,
  ImageOptions,
  TemplateImageOptions,
  // Header/footer elements
  HeaderFooterTextElement,
  HeaderFooterImageElement,
  HeaderFooterCardNumberElement,
  HeaderFooterElement,
  HeaderFooterOptions,
  // Card options
  CardOptions,
  // Sharing options
  EmailOptions,
  SharingOptions,
} from './types/index.js';

// =============================================================================
// Types - Request Types
// =============================================================================

export type {
  // Generation requests
  GenerateRequest,
  GenerateFromTemplateRequest,
  // Query parameters
  ListThemesParams,
  ListFoldersParams,
} from './types/index.js';

// =============================================================================
// Types - Response Types
// =============================================================================

export type {
  // Credit information
  Credits,
  // Generation responses
  GenerationStartResponse,
  GenerationPendingResponse,
  GenerationCompletedResponse,
  GenerationFailedResponse,
  GenerationStatusResponse,
  GenerationError,
  // Resource types
  Theme,
  Folder,
  // Pagination
  PaginatedResponse,
  // Error response
  ErrorResponse,
} from './types/index.js';

// =============================================================================
// Type Guards
// =============================================================================

export {
  isGenerationCompleted,
  isGenerationPending,
  isGenerationFailed,
} from './types/index.js';

// =============================================================================
// Errors
// =============================================================================

export {
  // Base error
  GammaError,
  // HTTP errors
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  GenerationFailedError,
  RateLimitError,
  ServerError,
  GatewayError,
  NetworkError,
  // Polling errors
  PollingTimeoutError,
  PollingCancelledError,
  // Utilities
  isRetryableError,
  parseApiError,
} from './errors/index.js';

// =============================================================================
// Utilities - Pagination
// =============================================================================

export type { Paginator, PageFetcher, PaginatorOptions, PaginatedResponse as PaginatorResponse } from './utils/pagination.js';
export { createPaginator } from './utils/pagination.js';

// =============================================================================
// Utilities - Polling
// =============================================================================

export type { PollingOptions, PollingProgress, FailureDetector } from './utils/polling.js';
export { pollForCompletion } from './utils/polling.js';
