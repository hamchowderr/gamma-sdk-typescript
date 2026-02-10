/**
 * Gamma SDK - Fluent Builder for Generation Requests
 *
 * This module provides a fluent builder pattern for constructing GenerateRequest objects.
 * The builder guides users through creating requests by enforcing required fields first,
 * showing relevant options based on earlier choices, and preventing invalid combinations
 * through the type system.
 */

import type {
  TextMode,
  TextAmount,
  Format,
  Dimension,
  CardSplit,
  ExportFormat,
  ImageSource,
  ImageModel,
  WorkspaceAccess,
  ExternalAccess,
  EmailAccess,
  HeaderFooterElementType,
  HeaderFooterImageSource,
  HeaderFooterImageSize,
} from '../types/enums';
import type { LanguageCode } from '../types/languages';

// =============================================================================
// Request and Option Types (defined here to avoid circular dependencies)
// =============================================================================

/**
 * Header/footer element configuration.
 */
export interface HeaderFooterElement {
  type: HeaderFooterElementType;
  text?: string;
  imageSource?: HeaderFooterImageSource;
  imageUrl?: string;
  imageSize?: HeaderFooterImageSize;
}

/**
 * Complete header/footer configuration for all positions.
 */
export interface HeaderFooterOptions {
  topLeft?: HeaderFooterElement;
  topCenter?: HeaderFooterElement;
  topRight?: HeaderFooterElement;
  bottomLeft?: HeaderFooterElement;
  bottomCenter?: HeaderFooterElement;
  bottomRight?: HeaderFooterElement;
  /** Hide header/footer from the first card */
  hideFromFirstCard?: boolean;
  /** Hide header/footer from the last card */
  hideFromLastCard?: boolean;
}

/**
 * Email sharing options.
 */
export interface EmailOptions {
  /** Email addresses to share with */
  recipients?: string[];
  /** Access level for email recipients */
  access?: EmailAccess;
}

/**
 * Sharing options for the generated gamma.
 */
export interface SharingOptions {
  workspaceAccess?: WorkspaceAccess;
  externalAccess?: ExternalAccess;
  emailOptions?: EmailOptions;
}

/**
 * Text processing options.
 */
export interface TextOptions {
  amount?: TextAmount;
  tone?: string;
  audience?: string;
  language?: LanguageCode;
}

/**
 * Image generation/sourcing options.
 */
export interface ImageOptions {
  source?: ImageSource;
  model?: ImageModel;
  style?: string;
}

/**
 * Card layout and configuration options.
 */
export interface CardOptions {
  dimensions?: Dimension;
  headerFooter?: HeaderFooterOptions;
}

/**
 * The complete GenerateRequest object built by the fluent builder.
 */
export interface GenerateRequest {
  inputText: string;
  textMode: TextMode;
  textOptions?: TextOptions;
  format?: Format;
  numCards?: number;
  cardSplit?: CardSplit;
  cardOptions?: CardOptions;
  imageOptions?: ImageOptions;
  themeId?: string;
  additionalInstructions?: string;
  folderIds?: string[];
  exportAs?: ExportFormat;
  sharingOptions?: SharingOptions;
}

// =============================================================================
// Internal State Interface
// =============================================================================

/**
 * Internal state used by all builders to accumulate options.
 */
interface BuilderState {
  inputText: string;
  textMode: TextMode;
  textOptions: TextOptions;
  format?: Format;
  numCards?: number;
  cardSplit?: CardSplit;
  cardOptions: CardOptions;
  imageOptions: ImageOptions;
  themeId?: string;
  additionalInstructions?: string;
  folderIds?: string[];
  exportAs?: ExportFormat;
  sharingOptions?: SharingOptions;
}

// =============================================================================
// Base Builder with Common Methods
// =============================================================================

/**
 * Base builder class with methods common to all text modes.
 * This abstract class provides format selection, card options, image options,
 * and other shared functionality.
 */
abstract class BaseBuilder<T extends BaseBuilder<T>> {
  protected readonly state: BuilderState;

  constructor(state: BuilderState) {
    this.state = state;
  }

  /**
   * Returns `this` with the correct subclass type for method chaining.
   */
  protected abstract self(): T;

  // ---------------------------------------------------------------------------
  // Format Selection
  // ---------------------------------------------------------------------------

  /**
   * Set the output format to presentation (slide deck).
   */
  asPresentation(): T {
    this.state.format = 'presentation';
    return this.self();
  }

  /**
   * Set the output format to document.
   */
  asDocument(): T {
    this.state.format = 'document';
    return this.self();
  }

  /**
   * Set the output format to social media.
   */
  asSocial(): T {
    this.state.format = 'social';
    return this.self();
  }

  /**
   * Set the output format to webpage.
   * Note: Webpage format does not support dimensions or header/footer options.
   */
  asWebpage(): T {
    this.state.format = 'webpage';
    return this.self();
  }

  // ---------------------------------------------------------------------------
  // Dimension Methods
  // ---------------------------------------------------------------------------

  /**
   * Set custom dimensions for the output.
   * The valid dimensions depend on the selected format.
   */
  withDimensions(dimensions: Dimension): T {
    this.state.cardOptions.dimensions = dimensions;
    return this.self();
  }

  /**
   * Use fluid (responsive) dimensions.
   * Works with presentation and document formats.
   */
  fluid(): T {
    this.state.cardOptions.dimensions = 'fluid';
    return this.self();
  }

  /**
   * Use widescreen (16:9) dimensions.
   * Best for presentations.
   */
  widescreen(): T {
    this.state.cardOptions.dimensions = '16x9';
    return this.self();
  }

  /**
   * Use standard (4:3) dimensions.
   * Classic presentation aspect ratio.
   */
  standard(): T {
    this.state.cardOptions.dimensions = '4x3';
    return this.self();
  }

  /**
   * Use US Letter size dimensions.
   * Best for documents.
   */
  letter(): T {
    this.state.cardOptions.dimensions = 'letter';
    return this.self();
  }

  /**
   * Use A4 paper size dimensions.
   * Best for documents.
   */
  a4(): T {
    this.state.cardOptions.dimensions = 'a4';
    return this.self();
  }

  /**
   * Use pageless (continuous scrolling) dimensions.
   * Best for documents.
   */
  pageless(): T {
    this.state.cardOptions.dimensions = 'pageless';
    return this.self();
  }

  /**
   * Use square (1:1) dimensions.
   * Best for social media (Instagram posts).
   */
  square(): T {
    this.state.cardOptions.dimensions = '1x1';
    return this.self();
  }

  /**
   * Use portrait (4:5) dimensions.
   * Best for social media (Instagram/Facebook).
   */
  portrait(): T {
    this.state.cardOptions.dimensions = '4x5';
    return this.self();
  }

  /**
   * Use story (9:16) vertical dimensions.
   * Best for social media stories (TikTok, Reels, Stories).
   */
  story(): T {
    this.state.cardOptions.dimensions = '9x16';
    return this.self();
  }

  // ---------------------------------------------------------------------------
  // Card Options
  // ---------------------------------------------------------------------------

  /**
   * Set the target number of cards/slides to generate.
   * @param numCards - Number of cards (1-50)
   */
  withCards(numCards: number): T {
    this.state.numCards = numCards;
    return this.self();
  }

  /**
   * Set how content is split across cards.
   * @param split - 'auto' for AI-determined breaks, 'inputTextBreaks' to use \n---\n markers
   */
  withCardSplit(split: CardSplit): T {
    this.state.cardSplit = split;
    return this.self();
  }

  /**
   * Configure header and footer elements for cards.
   * @param options - Header/footer configuration for each position
   */
  withHeaderFooter(options: HeaderFooterOptions): T {
    this.state.cardOptions.headerFooter = options;
    return this.self();
  }

  // ---------------------------------------------------------------------------
  // Image Options
  // ---------------------------------------------------------------------------

  /**
   * Set the image source for the generated gamma.
   * @param source - The image source type
   */
  withImages(source: ImageSource): T {
    this.state.imageOptions.source = source;
    return this.self();
  }

  /**
   * Use AI-generated images with optional model and style.
   * @param model - The AI image generation model to use
   * @param style - Style instructions for image generation
   */
  withAiImages(model?: ImageModel, style?: string): T {
    this.state.imageOptions.source = 'aiGenerated';
    if (model) {
      this.state.imageOptions.model = model;
    }
    if (style) {
      this.state.imageOptions.style = style;
    }
    return this.self();
  }

  /**
   * Disable images in the generated gamma.
   */
  noImages(): T {
    this.state.imageOptions.source = 'noImages';
    return this.self();
  }

  // ---------------------------------------------------------------------------
  // Other Options
  // ---------------------------------------------------------------------------

  /**
   * Set the theme to use for the generated gamma.
   * @param themeId - The ID of the theme to apply
   */
  withTheme(themeId: string): T {
    this.state.themeId = themeId;
    return this.self();
  }

  /**
   * Add custom instructions for the AI generation.
   * @param instructions - Additional instructions for content generation
   */
  withInstructions(instructions: string): T {
    this.state.additionalInstructions = instructions;
    return this.self();
  }

  /**
   * Specify folder(s) to save the generated gamma in.
   * @param folderIds - One or more folder IDs
   */
  inFolders(...folderIds: string[]): T {
    this.state.folderIds = folderIds;
    return this.self();
  }

  /**
   * Set the export format for the generated gamma.
   * @param format - 'pdf' or 'pptx'
   */
  exportAs(format: ExportFormat): T {
    this.state.exportAs = format;
    return this.self();
  }

  /**
   * Configure sharing options for the generated gamma.
   * @param options - Sharing configuration
   */
  withSharing(options: SharingOptions): T {
    this.state.sharingOptions = options;
    return this.self();
  }

  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------

  /**
   * Build the final GenerateRequest object.
   * @returns The complete GenerateRequest ready to send to the API
   */
  build(): GenerateRequest {
    const request: GenerateRequest = {
      inputText: this.state.inputText,
      textMode: this.state.textMode,
    };

    // Add text options if any are set
    if (Object.keys(this.state.textOptions).length > 0) {
      request.textOptions = { ...this.state.textOptions };
    }

    // Add format if set
    if (this.state.format) {
      request.format = this.state.format;
    }

    // Add top-level card properties
    if (this.state.numCards !== undefined) {
      request.numCards = this.state.numCards;
    }
    if (this.state.cardSplit !== undefined) {
      request.cardSplit = this.state.cardSplit;
    }

    // Add card options (dimensions, headerFooter) if any are set
    const cardOpts = this.state.cardOptions;
    if (cardOpts.dimensions !== undefined || cardOpts.headerFooter !== undefined) {
      request.cardOptions = {};
      if (cardOpts.dimensions !== undefined) {
        request.cardOptions.dimensions = cardOpts.dimensions;
      }
      if (cardOpts.headerFooter !== undefined) {
        request.cardOptions.headerFooter = cardOpts.headerFooter;
      }
    }

    // Add image options if any are set
    const imgOpts = this.state.imageOptions;
    if (
      imgOpts.source !== undefined ||
      imgOpts.model !== undefined ||
      imgOpts.style !== undefined
    ) {
      request.imageOptions = {};
      if (imgOpts.source !== undefined) {
        request.imageOptions.source = imgOpts.source;
      }
      if (imgOpts.model !== undefined) {
        request.imageOptions.model = imgOpts.model;
      }
      if (imgOpts.style !== undefined) {
        request.imageOptions.style = imgOpts.style;
      }
    }

    // Add other options if set
    if (this.state.themeId) {
      request.themeId = this.state.themeId;
    }
    if (this.state.additionalInstructions) {
      request.additionalInstructions = this.state.additionalInstructions;
    }
    if (this.state.folderIds && this.state.folderIds.length > 0) {
      request.folderIds = [...this.state.folderIds];
    }
    if (this.state.exportAs) {
      request.exportAs = this.state.exportAs;
    }
    if (this.state.sharingOptions) {
      request.sharingOptions = { ...this.state.sharingOptions };
    }

    return request;
  }
}

// =============================================================================
// Mode-Specific Builders
// =============================================================================

/**
 * Builder for 'generate' text mode.
 * Provides full text options including tone and audience.
 */
export class GenerateBuilder extends BaseBuilder<GenerateBuilder> {
  constructor(inputText: string) {
    super({
      inputText,
      textMode: 'generate',
      textOptions: {},
      cardOptions: {},
      imageOptions: {},
    });
  }

  protected self(): GenerateBuilder {
    return this;
  }

  /**
   * Set the tone for generated text.
   * Only available in 'generate' mode.
   * @param tone - Descriptive tone (e.g., "professional, authoritative")
   */
  withTone(tone: string): this {
    this.state.textOptions.tone = tone;
    return this;
  }

  /**
   * Set the target audience for generated text.
   * Only available in 'generate' mode.
   * @param audience - Target audience description (e.g., "team leads and managers")
   */
  withAudience(audience: string): this {
    this.state.textOptions.audience = audience;
    return this;
  }

  /**
   * Set the amount of text to generate per card.
   * @param amount - 'brief', 'medium', 'detailed', or 'extensive'
   */
  withTextAmount(amount: TextAmount): this {
    this.state.textOptions.amount = amount;
    return this;
  }

  /**
   * Set the output language for generated text.
   * @param language - Language code (e.g., 'en', 'es', 'fr')
   */
  withLanguage(language: LanguageCode): this {
    this.state.textOptions.language = language;
    return this;
  }
}

/**
 * Builder for 'condense' text mode.
 * Provides text amount and language options, but not tone/audience.
 */
export class CondenseBuilder extends BaseBuilder<CondenseBuilder> {
  constructor(inputText: string) {
    super({
      inputText,
      textMode: 'condense',
      textOptions: {},
      cardOptions: {},
      imageOptions: {},
    });
  }

  protected self(): CondenseBuilder {
    return this;
  }

  /**
   * Set the amount of text to generate per card.
   * @param amount - 'brief', 'medium', 'detailed', or 'extensive'
   */
  withTextAmount(amount: TextAmount): this {
    this.state.textOptions.amount = amount;
    return this;
  }

  /**
   * Set the output language for generated text.
   * @param language - Language code (e.g., 'en', 'es', 'fr')
   */
  withLanguage(language: LanguageCode): this {
    this.state.textOptions.language = language;
    return this;
  }
}

/**
 * Builder for 'preserve' text mode.
 * Only provides language option from text options.
 */
export class PreserveBuilder extends BaseBuilder<PreserveBuilder> {
  constructor(inputText: string) {
    super({
      inputText,
      textMode: 'preserve',
      textOptions: {},
      cardOptions: {},
      imageOptions: {},
    });
  }

  protected self(): PreserveBuilder {
    return this;
  }

  /**
   * Set the output language for the preserved text.
   * @param language - Language code (e.g., 'en', 'es', 'fr')
   */
  withLanguage(language: LanguageCode): this {
    this.state.textOptions.language = language;
    return this;
  }
}

// =============================================================================
// Text Mode Selector
// =============================================================================

/**
 * Intermediate step that selects the text processing mode.
 * This determines which builder and options are available.
 */
export class TextModeSelector {
  private readonly inputText: string;

  constructor(inputText: string) {
    this.inputText = inputText;
  }

  /**
   * Use 'generate' mode - AI generates new content based on input.
   * Provides full text options including tone, audience, amount, and language.
   */
  generate(): GenerateBuilder {
    return new GenerateBuilder(this.inputText);
  }

  /**
   * Use 'condense' mode - AI summarizes and condenses the input.
   * Provides text amount and language options, but not tone/audience.
   */
  condense(): CondenseBuilder {
    return new CondenseBuilder(this.inputText);
  }

  /**
   * Use 'preserve' mode - Input text is used as-is with minimal modification.
   * Only provides language option from text options.
   */
  preserve(): PreserveBuilder {
    return new PreserveBuilder(this.inputText);
  }
}

// =============================================================================
// Entry Point
// =============================================================================

/**
 * Entry point for building Gamma generation requests using a fluent API.
 *
 * @example
 * ```typescript
 * // Minimal request
 * const req1 = GammaRequest
 *   .create("Three tips for productivity")
 *   .generate()
 *   .build();
 *
 * // Full featured presentation
 * const req2 = GammaRequest
 *   .create("Remote team management strategies")
 *   .generate()
 *   .withTone("professional, authoritative")
 *   .withAudience("team leads and managers")
 *   .withTextAmount("medium")
 *   .asPresentation()
 *   .widescreen()
 *   .withCards(10)
 *   .withAiImages("flux-1-quick", "clean, modern, minimal")
 *   .withTheme("abc123")
 *   .exportAs("pdf")
 *   .build();
 *
 * // Document with preserve mode
 * const req3 = GammaRequest
 *   .create("# Slide 1\n...\n---\n# Slide 2\n...")
 *   .preserve()
 *   .withLanguage("en")
 *   .withCardSplit("inputTextBreaks")
 *   .asDocument()
 *   .a4()
 *   .noImages()
 *   .build();
 * ```
 */
export class GammaRequest {
  private constructor() {
    // Private constructor - use static factory method
  }

  /**
   * Create a new request builder with the given input text.
   * @param inputText - The source text for generation
   * @returns A TextModeSelector to choose the text processing mode
   */
  static create(inputText: string): TextModeSelector {
    return new TextModeSelector(inputText);
  }
}
