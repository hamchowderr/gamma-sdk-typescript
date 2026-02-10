/**
 * Gamma SDK - Builder Module Exports
 *
 * This module provides fluent builders for constructing Gamma API requests.
 * The builders guide users through creating valid requests and prevent
 * invalid combinations through the type system.
 */

// =============================================================================
// Generation Builder Exports
// =============================================================================

export {
  GammaRequest,
  TextModeSelector,
  GenerateBuilder,
  CondenseBuilder,
  PreserveBuilder,
} from './generation-builder';

export type {
  GenerateRequest,
  TextOptions,
  ImageOptions,
  CardOptions,
  HeaderFooterElement,
  HeaderFooterOptions,
  SharingOptions as GenerationSharingOptions,
  EmailOptions as GenerationEmailOptions,
} from './generation-builder';

// =============================================================================
// Template Builder Exports
// =============================================================================

export {
  GammaTemplateRequest,
  TemplateBuilder,
} from './template-builder';

export type {
  GenerateFromTemplateRequest,
  TemplateImageOptions,
  SharingOptions as TemplateSharingOptions,
  EmailOptions as TemplateEmailOptions,
} from './template-builder';
