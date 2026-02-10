/**
 * Gamma SDK - Themes Resource
 *
 * This module provides methods for listing and searching themes.
 * Themes control the visual appearance of generated gammas.
 */

import { HttpClient } from '../utils/http.js';
import { createPaginator, type Paginator } from '../utils/pagination.js';
import type { Theme, PaginatedResponse } from '../types/index.js';

/**
 * Options for listing themes.
 */
export interface ListThemesOptions {
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
   * Cursor token for fetching the next page.
   * Use the `nextCursor` value from a previous response.
   */
  after?: string;
}

/**
 * Resource class for managing themes.
 *
 * Themes control the visual appearance of generated gammas, including
 * colors, fonts, and overall styling. Both standard Gamma themes and
 * custom workspace themes are available through this resource.
 *
 * @example
 * ```typescript
 * // List all themes
 * const { data: themes } = await client.themes.list();
 *
 * // Search for themes by name
 * const { data: modernThemes } = await client.themes.search('modern');
 *
 * // Paginate through all themes
 * for await (const theme of client.themes.paginate().items()) {
 *   console.log(theme.name);
 * }
 * ```
 */
export class ThemesResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Lists themes with optional filtering and pagination.
   *
   * @param options - Optional query parameters
   * @returns A promise resolving to a paginated response of themes
   *
   * @example
   * ```typescript
   * // Get first page of themes
   * const { data, hasMore, nextCursor } = await client.themes.list();
   *
   * // Get next page
   * if (hasMore && nextCursor) {
   *   const nextPage = await client.themes.list({ after: nextCursor });
   * }
   *
   * // Filter by name
   * const filtered = await client.themes.list({ query: 'dark' });
   * ```
   */
  async list(options?: ListThemesOptions): Promise<PaginatedResponse<Theme>> {
    const params = this.buildQueryParams(options);
    const queryString = params.toString();
    const path = queryString ? `/themes?${queryString}` : '/themes';
    return this.http.get<PaginatedResponse<Theme>>(path);
  }

  /**
   * Searches for themes by name.
   * This is a convenience method that wraps `list()` with a query parameter.
   *
   * @param query - The search query (case-insensitive)
   * @param options - Optional additional parameters (limit, after)
   * @returns A promise resolving to a paginated response of matching themes
   *
   * @example
   * ```typescript
   * // Search for themes containing 'modern'
   * const { data: modernThemes } = await client.themes.search('modern');
   *
   * // Search with limit
   * const { data: themes } = await client.themes.search('blue', { limit: 10 });
   * ```
   */
  async search(
    query: string,
    options?: Omit<ListThemesOptions, 'query'>
  ): Promise<PaginatedResponse<Theme>> {
    return this.list({ ...options, query });
  }

  /**
   * Returns an async paginator for iterating through all themes.
   *
   * The paginator automatically handles cursor-based pagination,
   * fetching additional pages as needed.
   *
   * @param options - Optional query parameters (query and limit)
   * @returns A Paginator that yields pages or individual items
   *
   * @example
   * ```typescript
   * // Iterate over pages
   * for await (const page of client.themes.paginate()) {
   *   console.log(`Got ${page.data.length} themes`);
   * }
   *
   * // Iterate over individual themes
   * for await (const theme of client.themes.paginate().items()) {
   *   console.log(theme.name, theme.colorKeywords);
   * }
   *
   * // With search filter
   * for await (const theme of client.themes.paginate({ query: 'dark' }).items()) {
   *   console.log(theme.name);
   * }
   * ```
   */
  paginate(options?: Omit<ListThemesOptions, 'after'> & { signal?: AbortSignal }): Paginator<Theme> {
    const { signal, ...listOptions } = options ?? {};
    return createPaginator<Theme>(
      (cursor?: string) =>
        this.list(cursor !== undefined ? { ...listOptions, after: cursor } : listOptions),
      { signal }
    );
  }

  /**
   * Fetches all themes and returns them as a single array.
   *
   * **Warning**: This method loads all themes into memory. For large
   * datasets, consider using `paginate().items()` to process items
   * incrementally instead.
   *
   * @param options - Optional query parameters (query and limit per page)
   * @returns A promise resolving to an array of all themes
   *
   * @example
   * ```typescript
   * // Get all themes
   * const allThemes = await client.themes.listAll();
   * console.log(`Total themes: ${allThemes.length}`);
   *
   * // Get all themes matching a query
   * const darkThemes = await client.themes.listAll({ query: 'dark' });
   * ```
   */
  async listAll(
    options?: Omit<ListThemesOptions, 'after'> & { signal?: AbortSignal; maxItems?: number }
  ): Promise<Theme[]> {
    const { maxItems, ...paginateOptions } = options ?? {};
    return this.paginate(paginateOptions).toArray(maxItems);
  }

  /**
   * Builds URL query parameters from the options object.
   */
  private buildQueryParams(options?: ListThemesOptions): URLSearchParams {
    const params = new URLSearchParams();

    if (options?.query) {
      params.set('query', options.query);
    }

    if (options?.limit !== undefined) {
      params.set('limit', String(options.limit));
    }

    if (options?.after) {
      params.set('after', options.after);
    }

    return params;
  }
}
