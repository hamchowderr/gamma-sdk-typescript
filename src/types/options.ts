/**
 * Gamma SDK - Option Interface Definitions
 *
 * This module contains nested option interfaces used in generation requests.
 * These interfaces represent optional configuration objects for text, images,
 * cards, and sharing settings.
 */

import type {
  TextAmount,
  ImageSource,
  ImageModel,
  PresentationDimension,
  DocumentDimension,
  SocialDimension,
  WorkspaceAccess,
  ExternalAccess,
  EmailAccess,
  HeaderFooterImageSource,
  HeaderFooterImageSize,
} from './enums';
import type { LanguageCode } from './languages';

// =============================================================================
// Text Options
// =============================================================================

/**
 * Options for controlling text generation behavior.
 */
export interface TextOptions {
  /**
   * Controls the amount of text generated per card.
   * Only applicable when `textMode` is 'generate' or 'condense'.
   * @default 'medium'
   */
  amount?: TextAmount;

  /**
   * The mood or voice of the generated text.
   * Only applicable when `textMode` is 'generate'.
   * @minLength 1
   * @maxLength 500
   * @example "professional, inspiring"
   * @example "casual, friendly"
   */
  tone?: string;

  /**
   * Description of the target audience for the content.
   * Only applicable when `textMode` is 'generate'.
   * @minLength 1
   * @maxLength 500
   * @example "seven year olds"
   * @example "senior executives"
   * @example "software developers"
   */
  audience?: string;

  /**
   * The language code for the generated text output.
   * @default 'en'
   * @see LanguageCode for all supported language codes
   */
  language?: LanguageCode;
}

// =============================================================================
// Image Options
// =============================================================================

/**
 * Options for controlling image generation and sourcing.
 * Used in standard generation requests (POST /generations).
 */
export interface ImageOptions {
  /**
   * The source for images in the generated gamma.
   * @default 'aiGenerated'
   */
  source?: ImageSource;

  /**
   * The AI model to use for image generation.
   * Only applicable when `source` is 'aiGenerated'.
   * If not specified, an appropriate model is auto-selected.
   * @see ImageModel for available models and credit costs
   */
  model?: ImageModel;

  /**
   * Artistic style description for AI-generated images.
   * Only applicable when `source` is 'aiGenerated'.
   * @minLength 1
   * @maxLength 500
   * @example "minimal, black and white, line art"
   * @example "photorealistic, cinematic lighting"
   * @example "watercolor, soft edges, pastel colors"
   */
  style?: string;
}

/**
 * Image options for template-based generation.
 * When creating from a template, new images automatically match the image source
 * used in the original template. These options only apply when the original
 * template used AI-generated images.
 */
export interface TemplateImageOptions {
  /**
   * The AI model to use for image generation.
   * Only applicable when the template uses AI-generated images.
   * @see ImageModel for available models and credit costs
   */
  model?: ImageModel;

  /**
   * Artistic style description for AI-generated images.
   * Only applicable when the template uses AI-generated images.
   * @minLength 1
   * @maxLength 500
   */
  style?: string;
}

// =============================================================================
// Header/Footer Options
// =============================================================================

/**
 * A text element for header/footer positions.
 */
export interface HeaderFooterTextElement {
  /**
   * Element type identifier.
   */
  type: 'text';

  /**
   * The text content to display.
   */
  value: string;
}

/**
 * An image element for header/footer positions.
 */
export interface HeaderFooterImageElement {
  /**
   * Element type identifier.
   */
  type: 'image';

  /**
   * The source of the image.
   * - 'themeLogo': Use the logo from the selected theme
   * - 'custom': Use a custom image URL (requires `src`)
   */
  source: HeaderFooterImageSource;

  /**
   * The size of the image.
   * @default 'md'
   */
  size?: HeaderFooterImageSize;

  /**
   * Custom image URL. Required when `source` is 'custom'.
   * Must be a valid, publicly accessible image URL.
   */
  src?: string;
}

/**
 * A card number element for header/footer positions.
 * Displays the current card/slide number dynamically.
 */
export interface HeaderFooterCardNumberElement {
  /**
   * Element type identifier.
   */
  type: 'cardNumber';
}

/**
 * Union type for any header/footer element.
 */
export type HeaderFooterElement =
  | HeaderFooterTextElement
  | HeaderFooterImageElement
  | HeaderFooterCardNumberElement;

/**
 * Configuration for header and footer elements on cards.
 * Not applicable when format is 'webpage'.
 */
export interface HeaderFooterOptions {
  /**
   * Element to display in the top-left position.
   */
  topLeft?: HeaderFooterElement;

  /**
   * Element to display in the top-center position.
   */
  topCenter?: HeaderFooterElement;

  /**
   * Element to display in the top-right position.
   */
  topRight?: HeaderFooterElement;

  /**
   * Element to display in the bottom-left position.
   */
  bottomLeft?: HeaderFooterElement;

  /**
   * Element to display in the bottom-center position.
   */
  bottomCenter?: HeaderFooterElement;

  /**
   * Element to display in the bottom-right position.
   */
  bottomRight?: HeaderFooterElement;

  /**
   * Whether to hide the header/footer from the first card.
   * Useful for title slides.
   * @default false
   */
  hideFromFirstCard?: boolean;

  /**
   * Whether to hide the header/footer from the last card.
   * Useful for ending/thank-you slides.
   * @default false
   */
  hideFromLastCard?: boolean;
}

// =============================================================================
// Card Options
// =============================================================================

/**
 * Options for card/slide configuration.
 * Note: `dimensions` is not applicable when format is 'webpage'.
 */
export interface CardOptions {
  /**
   * The aspect ratio/dimensions for cards.
   * The valid values depend on the selected format:
   * - presentation: 'fluid' | '16x9' | '4x3'
   * - document: 'fluid' | 'pageless' | 'letter' | 'a4'
   * - social: '1x1' | '4x5' | '9x16'
   * - webpage: not applicable
   */
  dimensions?: PresentationDimension | DocumentDimension | SocialDimension;

  /**
   * Header and footer configuration for cards.
   * Not applicable when format is 'webpage'.
   */
  headerFooter?: HeaderFooterOptions;
}

// =============================================================================
// Sharing Options
// =============================================================================

/**
 * Options for email-based sharing.
 */
export interface EmailOptions {
  /**
   * Email addresses to share the gamma with.
   * Each recipient will receive an email notification.
   */
  recipients?: string[];

  /**
   * Access level granted to email recipients.
   */
  access?: EmailAccess;
}

/**
 * Options for controlling access and sharing of the generated gamma.
 */
export interface SharingOptions {
  /**
   * Access level for workspace members.
   * If not specified, workspace default sharing settings are used.
   */
  workspaceAccess?: WorkspaceAccess;

  /**
   * Access level for external users (non-workspace members).
   * If not specified, workspace default sharing settings are used.
   */
  externalAccess?: ExternalAccess;

  /**
   * Email sharing options for sending the gamma to specific recipients.
   */
  emailOptions?: EmailOptions;
}
