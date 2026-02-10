/**
 * Gamma SDK - Type Definitions
 *
 * This module re-exports all type definitions for the Gamma SDK.
 * Import from this module for convenient access to all types.
 *
 * @example
 * ```typescript
 * import type {
 *   GenerateRequest,
 *   GenerationCompletedResponse,
 *   Theme,
 *   TextMode,
 *   Format,
 * } from 'gamma-sdk/types';
 * ```
 */

// =============================================================================
// Enum Types (String Literal Unions)
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
} from './enums';

// =============================================================================
// Language Codes
// =============================================================================

export type { LanguageCode } from './languages';
export { LANGUAGE_NAMES } from './languages';

// =============================================================================
// Option Interfaces
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
} from './options';

// =============================================================================
// Request Types
// =============================================================================

export type {
  // Generation requests
  GenerateRequest,
  GenerateFromTemplateRequest,
  // Query parameters
  ListThemesParams,
  ListFoldersParams,
} from './requests';

// =============================================================================
// Response Types
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
} from './responses';

// =============================================================================
// Type Guards
// =============================================================================

export {
  isGenerationCompleted,
  isGenerationPending,
  isGenerationFailed,
} from './responses';
