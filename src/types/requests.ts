/**
 * Gamma SDK - Request Type Definitions
 *
 * This module contains types for API request bodies and query parameters.
 */

import type { TextMode, Format, CardSplit, ExportFormat } from './enums';
import type { TextOptions, ImageOptions, TemplateImageOptions, CardOptions, SharingOptions } from './options';

// =============================================================================
// Generation Requests
// =============================================================================

/**
 * Request body for creating a new gamma from scratch.
 * POST /v1.0/generations
 */
export interface GenerateRequest {
  /**
   * The content used to generate the gamma.
   * Supports plain text and image URLs.
   * Use `\n---\n` to define card breaks when using `cardSplit: 'inputTextBreaks'`.
   *
   * @minLength 1
   * @maxLength ~400,000 characters (100,000 tokens)
   * @required
   */
  inputText: string;

  /**
   * How the input text should be processed.
   *
   * - `generate`: AI generates new content based on the input
   * - `condense`: AI summarizes and condenses the input
   * - `preserve`: Input text is used with minimal modification
   *
   * @required
   */
  textMode: TextMode;

  /**
   * The output format for the generated gamma.
   * @default 'presentation'
   */
  format?: Format;

  /**
   * The theme ID to apply to the generated gamma.
   * Can be obtained from GET /themes or copied from the Gamma app.
   * If not specified, the workspace default theme is used.
   */
  themeId?: string;

  /**
   * The target number of cards/slides to generate.
   * Only used when `cardSplit` is 'auto'.
   *
   * - Pro plan: 1-60 cards
   * - Ultra plan: 1-75 cards
   *
   * @default 10
   * @minimum 1
   * @maximum 75
   */
  numCards?: number;

  /**
   * How content should be divided into cards.
   *
   * - `auto`: AI automatically determines card breaks based on numCards
   * - `inputTextBreaks`: Use `\n---\n` markers in inputText to define breaks
   *
   * @default 'auto'
   */
  cardSplit?: CardSplit;

  /**
   * Additional instructions for the AI to follow during generation.
   * Use for specific requirements, constraints, or preferences.
   *
   * @minLength 1
   * @maxLength 2000
   * @example "Include a summary slide at the end"
   * @example "Use bullet points instead of paragraphs"
   */
  additionalInstructions?: string;

  /**
   * Folder IDs where the generated gamma should be stored.
   * The API user must be a member of the specified folders.
   * Folder IDs can be obtained from GET /folders.
   */
  folderIds?: string[];

  /**
   * Export format for downloading the generated gamma.
   * If specified, the completed generation response will include
   * a download URL. Note: Export URLs expire after a period of time.
   */
  exportAs?: ExportFormat;

  /**
   * Options for controlling text generation behavior.
   */
  textOptions?: TextOptions;

  /**
   * Options for controlling image sourcing and generation.
   */
  imageOptions?: ImageOptions;

  /**
   * Options for card/slide dimensions and header/footer configuration.
   */
  cardOptions?: CardOptions;

  /**
   * Options for controlling access and sharing of the generated gamma.
   */
  sharingOptions?: SharingOptions;
}

/**
 * Request body for creating a gamma from an existing template.
 * POST /v1.0/generations/from-template
 *
 * Note: This endpoint is currently in beta. Functionality, rate limits,
 * and pricing are subject to change.
 */
export interface GenerateFromTemplateRequest {
  /**
   * The template ID to use as the base for generation.
   * Format: `g_abcdef123456ghi`
   * Can be found in the Gamma app by viewing the template details.
   *
   * @required
   * @pattern ^g_[a-zA-Z0-9]+$
   */
  gammaId: string;

  /**
   * Text content, image URLs, and instructions for the generation.
   * This content is used to populate and customize the template.
   * Token limit is shared with the template content (~400,000 chars total).
   *
   * @required
   * @minLength 1
   * @maxLength ~400,000 characters (shared with template)
   */
  prompt: string;

  /**
   * The theme ID to apply to the generated gamma.
   * If not specified, the template's original theme is used.
   */
  themeId?: string;

  /**
   * Folder IDs where the generated gamma should be stored.
   * The API user must be a member of the specified folders.
   */
  folderIds?: string[];

  /**
   * Export format for downloading the generated gamma.
   * If specified, the completed generation response will include
   * a download URL. Note: Export URLs expire after a period of time.
   */
  exportAs?: ExportFormat;

  /**
   * Image options for template-based generation.
   * These options only apply when the original template uses AI-generated images.
   * New images automatically match the image source used in the original template.
   */
  imageOptions?: TemplateImageOptions;

  /**
   * Options for controlling access and sharing of the generated gamma.
   */
  sharingOptions?: SharingOptions;
}

// =============================================================================
// List/Query Parameters
// =============================================================================

/**
 * Query parameters for listing themes.
 * GET /v1.0/themes
 */
export interface ListThemesParams {
  /**
   * Search query to filter themes by name (case-insensitive).
   */
  query?: string;

  /**
   * Maximum number of themes to return per page.
   * @maximum 50
   */
  limit?: number;

  /**
   * Cursor token for pagination.
   * Use the `nextCursor` value from a previous response.
   */
  after?: string;
}

/**
 * Query parameters for listing folders.
 * GET /v1.0/folders
 */
export interface ListFoldersParams {
  /**
   * Search query to filter folders by name (case-insensitive).
   */
  query?: string;

  /**
   * Maximum number of folders to return per page.
   * @maximum 50
   */
  limit?: number;

  /**
   * Cursor token for pagination.
   * Use the `nextCursor` value from a previous response.
   */
  after?: string;
}
