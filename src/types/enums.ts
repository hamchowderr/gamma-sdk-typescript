/**
 * Gamma SDK - Enum Type Definitions
 *
 * This module contains all string literal union types used throughout the SDK.
 * These types provide type-safe alternatives to raw strings for API parameters.
 */

// =============================================================================
// Text Processing Modes
// =============================================================================

/**
 * Determines how the input text is processed during generation.
 *
 * - `generate`: AI generates new content based on the input text
 * - `condense`: AI summarizes and condenses the input text
 * - `preserve`: Input text is used as-is with minimal modification
 */
export type TextMode = 'generate' | 'condense' | 'preserve';

/**
 * Controls the amount of text generated per card.
 * Only applicable when `textMode` is 'generate' or 'condense'.
 *
 * - `brief`: Minimal text, bullet points
 * - `medium`: Balanced amount of text (default)
 * - `detailed`: More comprehensive text
 * - `extensive`: Maximum text density
 */
export type TextAmount = 'brief' | 'medium' | 'detailed' | 'extensive';

// =============================================================================
// Output Format Types
// =============================================================================

/**
 * The output format for the generated gamma.
 *
 * - `presentation`: Slide deck format (default)
 * - `document`: Document/page format
 * - `social`: Social media optimized format
 * - `webpage`: Web page format (no dimensions/header-footer support)
 */
export type Format = 'presentation' | 'document' | 'social' | 'webpage';

/**
 * Controls how content is divided into cards.
 *
 * - `auto`: AI automatically determines card breaks based on numCards
 * - `inputTextBreaks`: Use `\n---\n` markers in input text to define card breaks
 */
export type CardSplit = 'auto' | 'inputTextBreaks';

/**
 * Export file format for the generated gamma.
 * Note: Export file URLs expire after a period of time.
 *
 * - `pdf`: PDF document format
 * - `pptx`: PowerPoint presentation format
 */
export type ExportFormat = 'pdf' | 'pptx';

// =============================================================================
// Dimension Types by Format
// =============================================================================

/**
 * Dimension options for presentation format.
 *
 * - `fluid`: Flexible/responsive dimensions (default)
 * - `16x9`: Widescreen aspect ratio
 * - `4x3`: Standard/classic aspect ratio
 */
export type PresentationDimension = 'fluid' | '16x9' | '4x3';

/**
 * Dimension options for document format.
 *
 * - `fluid`: Flexible/responsive dimensions (default)
 * - `pageless`: Continuous scrolling without page breaks
 * - `letter`: US Letter size (8.5" x 11")
 * - `a4`: A4 paper size (210mm x 297mm)
 */
export type DocumentDimension = 'fluid' | 'pageless' | 'letter' | 'a4';

/**
 * Dimension options for social media format.
 *
 * - `1x1`: Square format (Instagram posts)
 * - `4x5`: Portrait format (Instagram/Facebook, default)
 * - `9x16`: Vertical/stories format (TikTok, Reels, Stories)
 */
export type SocialDimension = '1x1' | '4x5' | '9x16';

/**
 * Union of all possible dimension values across all formats.
 * Use format-specific dimension types when possible for better type safety.
 */
export type Dimension = PresentationDimension | DocumentDimension | SocialDimension;

// =============================================================================
// Image Source and Model Types
// =============================================================================

/**
 * Source for images used in the generated gamma.
 *
 * - `aiGenerated`: AI-generated images (default)
 * - `pictographic`: Icon/pictogram style images from Pictographic
 * - `pexels`: Stock photos from Pexels
 * - `unsplash`: Stock photos from Unsplash
 * - `giphy`: Animated GIFs from Giphy
 * - `webAllImages`: Web search for all images (licensing may be unknown)
 * - `webFreeToUse`: Web search for free-to-use images (personal use)
 * - `webFreeToUseCommercially`: Web search for commercially-free images
 * - `placeholder`: Placeholder images for manual replacement later
 * - `noImages`: No images in the output (use when providing your own image URLs)
 *
 * Note: Both `pexels` and `unsplash` are accepted by the API for stock photos.
 */
export type ImageSource =
  | 'aiGenerated'
  | 'pictographic'
  | 'pexels'
  | 'unsplash'
  | 'giphy'
  | 'webAllImages'
  | 'webFreeToUse'
  | 'webFreeToUseCommercially'
  | 'placeholder'
  | 'noImages';

/**
 * AI image generation model.
 * Only applicable when `imageOptions.source` is 'aiGenerated'.
 *
 * Credit costs and plan restrictions vary by model:
 * - 2 credits: flux-1-quick, flux-kontext-fast, imagen-3-flash, luma-photon-flash-1
 * - 8 credits: flux-1-pro, imagen-3-pro
 * - 10 credits: ideogram-v3-turbo, luma-photon-1
 * - 15 credits: leonardo-phoenix
 * - 20 credits: flux-kontext-pro, gemini-2.5-flash-image, ideogram-v3, imagen-4-pro, recraft-v3
 * - 30 credits: gpt-image-1-medium, flux-1-ultra (Ultra only), imagen-4-ultra (Ultra only)
 * - 33 credits: dall-e-3
 * - 40 credits: flux-kontext-max (Ultra only), recraft-v3-svg
 * - 45 credits: ideogram-v3-quality (Ultra only)
 * - 120 credits: gpt-image-1-high (Ultra only)
 */
export type ImageModel =
  // 2 credits
  | 'flux-1-quick'
  | 'flux-kontext-fast'
  | 'imagen-3-flash'
  | 'luma-photon-flash-1'
  // 8 credits
  | 'flux-1-pro'
  | 'imagen-3-pro'
  // 10 credits
  | 'ideogram-v3-turbo'
  | 'luma-photon-1'
  // 15 credits
  | 'leonardo-phoenix'
  // 20 credits
  | 'flux-kontext-pro'
  | 'gemini-2.5-flash-image'
  | 'ideogram-v3'
  | 'imagen-4-pro'
  | 'recraft-v3'
  // 30 credits
  | 'gpt-image-1-medium'
  | 'flux-1-ultra'
  | 'imagen-4-ultra'
  // 33 credits
  | 'dall-e-3'
  // 40 credits
  | 'flux-kontext-max'
  | 'recraft-v3-svg'
  // 45 credits
  | 'ideogram-v3-quality'
  // 120 credits
  | 'gpt-image-1-high';

// =============================================================================
// Access Control Types
// =============================================================================

/**
 * Access level for workspace members.
 *
 * - `noAccess`: No access to the gamma
 * - `view`: Can view the gamma
 * - `comment`: Can view and comment
 * - `edit`: Can view, comment, and edit
 * - `fullAccess`: Full access including sharing and deletion
 */
export type WorkspaceAccess = 'noAccess' | 'view' | 'comment' | 'edit' | 'fullAccess';

/**
 * Access level for external users (non-workspace members).
 * Note: External users cannot have `fullAccess`.
 *
 * - `noAccess`: No access to the gamma
 * - `view`: Can view the gamma
 * - `comment`: Can view and comment
 * - `edit`: Can view, comment, and edit
 */
export type ExternalAccess = 'noAccess' | 'view' | 'comment' | 'edit';

/**
 * Access level for email recipients.
 *
 * - `view`: Can view the gamma
 * - `comment`: Can view and comment
 * - `edit`: Can view, comment, and edit
 * - `fullAccess`: Full access including sharing and deletion
 */
export type EmailAccess = 'view' | 'comment' | 'edit' | 'fullAccess';

// =============================================================================
// Header/Footer Types
// =============================================================================

/**
 * Type of element that can appear in header/footer positions.
 *
 * - `text`: Static text content
 * - `image`: Image (theme logo or custom URL)
 * - `cardNumber`: Dynamic card/slide number
 */
export type HeaderFooterElementType = 'text' | 'image' | 'cardNumber';

/**
 * Source for header/footer images.
 *
 * - `themeLogo`: Use the logo from the selected theme
 * - `custom`: Use a custom image URL
 */
export type HeaderFooterImageSource = 'themeLogo' | 'custom';

/**
 * Size options for header/footer images.
 *
 * - `sm`: Small
 * - `md`: Medium
 * - `lg`: Large
 * - `xl`: Extra large
 */
export type HeaderFooterImageSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Position identifiers for header/footer elements.
 */
export type HeaderFooterPosition =
  | 'topLeft'
  | 'topCenter'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomCenter'
  | 'bottomRight';

// =============================================================================
// Theme and Status Types
// =============================================================================

/**
 * Type of theme.
 *
 * - `standard`: Global theme available to all users
 * - `custom`: Workspace-specific custom theme
 */
export type ThemeType = 'standard' | 'custom';

/**
 * Status of a generation request.
 *
 * - `pending`: Generation is in progress
 * - `completed`: Generation has finished successfully
 * - `failed`: Generation has failed (check error details)
 */
export type GenerationStatus = 'pending' | 'completed' | 'failed';
