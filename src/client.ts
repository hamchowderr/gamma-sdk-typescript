/**
 * Gamma SDK - Main Client
 *
 * This module provides the main GammaClient class for interacting with the Gamma API.
 */

import { GenerationsResource } from './resources/generations.js';
import { ThemesResource } from './resources/themes.js';
import { FoldersResource } from './resources/folders.js';
import { HttpClient, HttpClientConfig } from './utils/http.js';
import type { PollingOptions } from './utils/polling.js';

/**
 * Default base URL for the Gamma API.
 */
const DEFAULT_BASE_URL = 'https://public-api.gamma.app/v1.0';

/**
 * Configuration options for the Gamma client.
 */
export interface GammaClientConfig {
  /**
   * Your Gamma API key.
   * Obtain this from the Gamma app's API settings.
   * @required
   */
  apiKey: string;

  /**
   * Base URL for the Gamma API.
   * Override for testing or custom environments.
   * @default 'https://public-api.gamma.app/v1.0'
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds.
   * @default 30000 (30 seconds)
   */
  timeout?: number;

  /**
   * Number of retries for transient errors.
   * @default 3
   */
  retries?: number;

  /**
   * Default polling options for generation methods.
   * These can be overridden per-request.
   */
  polling?: PollingOptions;
}

/**
 * The main client for interacting with the Gamma API.
 *
 * Provides access to all Gamma API resources:
 * - `generations`: Create and manage content generations
 * - `themes`: List and search available themes
 * - `folders`: List and search folders for organizing content
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
 * @example
 * ```typescript
 * // With custom configuration
 * const client = new GammaClient({
 *   apiKey: 'sk-gamma-your-api-key',
 *   timeout: 60000, // 60 second timeout
 *   retries: 5,
 *   polling: {
 *     intervalMs: 5000, // Check every 5 seconds
 *     timeoutMs: 300000, // 5 minute max wait
 *   },
 * });
 * ```
 */
export class GammaClient {
  /**
   * Resource for creating and managing content generations.
   *
   * @example
   * ```typescript
   * // Create and wait for completion
   * const result = await client.generations.createAndWait({
   *   inputText: 'My content',
   *   textMode: 'generate',
   * });
   *
   * // Or manage polling manually
   * const { generationId } = await client.generations.create({
   *   inputText: 'My content',
   *   textMode: 'generate',
   * });
   * const status = await client.generations.getStatus(generationId);
   * ```
   */
  readonly generations: GenerationsResource;

  /**
   * Resource for listing and searching themes.
   *
   * @example
   * ```typescript
   * // List all themes
   * const { data: themes } = await client.themes.list();
   *
   * // Search for themes
   * const { data: darkThemes } = await client.themes.search('dark');
   *
   * // Paginate through all themes
   * for await (const theme of client.themes.paginate().items()) {
   *   console.log(theme.name);
   * }
   * ```
   */
  readonly themes: ThemesResource;

  /**
   * Resource for listing and searching folders.
   *
   * @example
   * ```typescript
   * // List all folders
   * const { data: folders } = await client.folders.list();
   *
   * // Search for folders
   * const { data: projectFolders } = await client.folders.search('project');
   *
   * // Use folder in generation
   * await client.generations.createAndWait({
   *   inputText: 'My content',
   *   textMode: 'generate',
   *   folderIds: [folders[0].id],
   * });
   * ```
   */
  readonly folders: FoldersResource;

  /**
   * The underlying HTTP client used for API requests.
   * Exposed for advanced use cases.
   * @internal
   */
  private readonly http: HttpClient;

  /**
   * Creates a new Gamma client.
   *
   * @param config - Client configuration options
   * @throws {Error} If apiKey is not provided
   *
   * @example
   * ```typescript
   * const client = new GammaClient({
   *   apiKey: 'sk-gamma-your-api-key',
   * });
   * ```
   */
  constructor(config: GammaClientConfig) {
    if (!config.apiKey) {
      throw new Error('API key is required. Get your API key from the Gamma app.');
    }

    const httpConfig: HttpClientConfig = {
      baseUrl: config.baseUrl ?? DEFAULT_BASE_URL,
      apiKey: config.apiKey,
      ...(config.timeout !== undefined && { timeout: config.timeout }),
      ...(config.retries !== undefined && { retries: config.retries }),
    };

    this.http = new HttpClient(httpConfig);
    this.generations = new GenerationsResource(this.http);
    this.themes = new ThemesResource(this.http);
    this.folders = new FoldersResource(this.http);
  }
}

/**
 * Creates a new Gamma client.
 * This is a convenience factory function as an alternative to `new GammaClient()`.
 *
 * @param config - Client configuration options
 * @returns A new GammaClient instance
 *
 * @example
 * ```typescript
 * import { createGammaClient } from 'gamma-sdk';
 *
 * const client = createGammaClient({
 *   apiKey: 'sk-gamma-your-api-key',
 * });
 * ```
 */
export function createGammaClient(config: GammaClientConfig): GammaClient {
  return new GammaClient(config);
}
