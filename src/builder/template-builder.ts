/**
 * Gamma SDK - Fluent Builder for Template-Based Generation Requests
 *
 * This module provides a fluent builder pattern for constructing
 * GenerateFromTemplateRequest objects. Use this when generating content
 * based on an existing gamma template.
 */

import type { ExportFormat, ImageModel, WorkspaceAccess, ExternalAccess, EmailAccess } from '../types/enums';

// =============================================================================
// Request and Option Types
// =============================================================================

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
 * Image generation options for template-based generation.
 */
export interface TemplateImageOptions {
  model?: ImageModel;
  style?: string;
}

/**
 * The complete GenerateFromTemplateRequest object built by the fluent builder.
 */
export interface GenerateFromTemplateRequest {
  gammaId: string;
  prompt: string;
  themeId?: string;
  folderIds?: string[];
  exportAs?: ExportFormat;
  imageOptions?: TemplateImageOptions;
  sharingOptions?: SharingOptions;
}

// =============================================================================
// Template Builder
// =============================================================================

/**
 * Builder for template-based generation requests.
 * Use this when you want to generate new content based on an existing gamma.
 */
export class TemplateBuilder {
  private readonly gammaId: string;
  private readonly prompt: string;
  private themeId?: string;
  private folderIds?: string[];
  private _exportAs?: ExportFormat;
  private imageOptions: TemplateImageOptions = {};
  private sharingOptions?: SharingOptions;

  constructor(gammaId: string, prompt: string) {
    this.gammaId = gammaId;
    this.prompt = prompt;
  }

  /**
   * Set the theme to use for the generated gamma.
   * @param themeId - The ID of the theme to apply
   */
  withTheme(themeId: string): this {
    this.themeId = themeId;
    return this;
  }

  /**
   * Specify folder(s) to save the generated gamma in.
   * @param folderIds - One or more folder IDs
   */
  inFolders(...folderIds: string[]): this {
    this.folderIds = folderIds;
    return this;
  }

  /**
   * Set the export format for the generated gamma.
   * @param format - 'pdf' or 'pptx'
   */
  exportAs(format: ExportFormat): this {
    this._exportAs = format;
    return this;
  }

  /**
   * Configure AI image generation settings.
   * @param model - The AI image generation model to use
   * @param style - Style instructions for image generation
   */
  withAiImages(model?: ImageModel, style?: string): this {
    if (model) {
      this.imageOptions.model = model;
    }
    if (style) {
      this.imageOptions.style = style;
    }
    return this;
  }

  /**
   * Configure sharing options for the generated gamma.
   * @param options - Sharing configuration
   */
  withSharing(options: SharingOptions): this {
    this.sharingOptions = options;
    return this;
  }

  /**
   * Build the final GenerateFromTemplateRequest object.
   * @returns The complete request ready to send to the API
   */
  build(): GenerateFromTemplateRequest {
    const request: GenerateFromTemplateRequest = {
      gammaId: this.gammaId,
      prompt: this.prompt,
    };

    if (this.themeId) {
      request.themeId = this.themeId;
    }

    if (this.folderIds && this.folderIds.length > 0) {
      request.folderIds = [...this.folderIds];
    }

    if (this._exportAs) {
      request.exportAs = this._exportAs;
    }

    // Add image options if any are set
    if (this.imageOptions.model || this.imageOptions.style) {
      request.imageOptions = { ...this.imageOptions };
    }

    if (this.sharingOptions) {
      request.sharingOptions = { ...this.sharingOptions };
    }

    return request;
  }
}

// =============================================================================
// Entry Point
// =============================================================================

/**
 * Entry point for building template-based generation requests using a fluent API.
 *
 * @example
 * ```typescript
 * // Basic template-based generation
 * const req1 = GammaTemplateRequest
 *   .create("g_abc123", "Update with Q1 2026 data and new metrics")
 *   .build();
 *
 * // Full featured template request
 * const req2 = GammaTemplateRequest
 *   .create("g_abc123", "Update with Q1 2026 data...")
 *   .withAiImages("imagen-4-pro", "corporate, professional")
 *   .withTheme("theme_xyz")
 *   .inFolders("folder_1", "folder_2")
 *   .exportAs("pptx")
 *   .withSharing({
 *     workspaceAccess: "view",
 *     externalAccess: "noAccess"
 *   })
 *   .build();
 * ```
 */
export class GammaTemplateRequest {
  private constructor() {
    // Private constructor - use static factory method
  }

  /**
   * Create a new template-based request builder.
   * @param gammaId - The ID of the existing gamma to use as a template
   * @param prompt - Instructions for how to update/generate the content
   * @returns A TemplateBuilder to configure additional options
   */
  static create(gammaId: string, prompt: string): TemplateBuilder {
    return new TemplateBuilder(gammaId, prompt);
  }
}
