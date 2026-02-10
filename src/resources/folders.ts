/**
 * Gamma SDK - Folders Resource
 *
 * This module provides methods for listing and searching folders.
 * Folders help organize generated gammas in the Gamma workspace.
 */

import { HttpClient } from '../utils/http.js';
import { createPaginator, type Paginator } from '../utils/pagination.js';
import type { Folder, PaginatedResponse } from '../types/index.js';

/**
 * Options for listing folders.
 */
export interface ListFoldersOptions {
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
   * Cursor token for fetching the next page.
   * Use the `nextCursor` value from a previous response.
   */
  after?: string;
}

/**
 * Resource class for managing folders.
 *
 * Folders are used to organize generated gammas within a workspace.
 * You can specify folder IDs in generation requests to automatically
 * store new gammas in those folders.
 *
 * @example
 * ```typescript
 * // List all folders
 * const { data: folders } = await client.folders.list();
 *
 * // Search for folders by name
 * const { data: projectFolders } = await client.folders.search('project');
 *
 * // Use a folder in a generation request
 * const folder = folders[0];
 * await client.generations.createAndWait({
 *   inputText: 'My content',
 *   textMode: 'generate',
 *   folderIds: [folder.id],
 * });
 * ```
 */
export class FoldersResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Lists folders with optional filtering and pagination.
   *
   * @param options - Optional query parameters
   * @returns A promise resolving to a paginated response of folders
   *
   * @example
   * ```typescript
   * // Get first page of folders
   * const { data, hasMore, nextCursor } = await client.folders.list();
   *
   * // Get next page
   * if (hasMore && nextCursor) {
   *   const nextPage = await client.folders.list({ after: nextCursor });
   * }
   *
   * // Filter by name
   * const filtered = await client.folders.list({ query: 'marketing' });
   * ```
   */
  async list(options?: ListFoldersOptions): Promise<PaginatedResponse<Folder>> {
    const params = this.buildQueryParams(options);
    const queryString = params.toString();
    const path = queryString ? `/folders?${queryString}` : '/folders';
    return this.http.get<PaginatedResponse<Folder>>(path);
  }

  /**
   * Searches for folders by name.
   * This is a convenience method that wraps `list()` with a query parameter.
   *
   * @param query - The search query (case-insensitive)
   * @param options - Optional additional parameters (limit, after)
   * @returns A promise resolving to a paginated response of matching folders
   *
   * @example
   * ```typescript
   * // Search for folders containing 'marketing'
   * const { data: marketingFolders } = await client.folders.search('marketing');
   *
   * // Search with limit
   * const { data: folders } = await client.folders.search('project', { limit: 5 });
   * ```
   */
  async search(
    query: string,
    options?: Omit<ListFoldersOptions, 'query'>
  ): Promise<PaginatedResponse<Folder>> {
    return this.list({ ...options, query });
  }

  /**
   * Returns an async paginator for iterating through all folders.
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
   * for await (const page of client.folders.paginate()) {
   *   console.log(`Got ${page.data.length} folders`);
   * }
   *
   * // Iterate over individual folders
   * for await (const folder of client.folders.paginate().items()) {
   *   console.log(folder.name);
   * }
   *
   * // With search filter
   * for await (const folder of client.folders.paginate({ query: 'team' }).items()) {
   *   console.log(folder.name);
   * }
   * ```
   */
  paginate(options?: Omit<ListFoldersOptions, 'after'> & { signal?: AbortSignal }): Paginator<Folder> {
    const { signal, ...listOptions } = options ?? {};
    return createPaginator<Folder>(
      (cursor?: string) =>
        this.list(cursor !== undefined ? { ...listOptions, after: cursor } : listOptions),
      { signal }
    );
  }

  /**
   * Fetches all folders and returns them as a single array.
   *
   * **Warning**: This method loads all folders into memory. For large
   * datasets, consider using `paginate().items()` to process items
   * incrementally instead.
   *
   * @param options - Optional query parameters (query and limit per page)
   * @returns A promise resolving to an array of all folders
   *
   * @example
   * ```typescript
   * // Get all folders
   * const allFolders = await client.folders.listAll();
   * console.log(`Total folders: ${allFolders.length}`);
   *
   * // Get all folders matching a query
   * const projectFolders = await client.folders.listAll({ query: 'project' });
   * ```
   */
  async listAll(
    options?: Omit<ListFoldersOptions, 'after'> & { signal?: AbortSignal; maxItems?: number }
  ): Promise<Folder[]> {
    const { maxItems, ...paginateOptions } = options ?? {};
    return this.paginate(paginateOptions).toArray(maxItems);
  }

  /**
   * Builds URL query parameters from the options object.
   */
  private buildQueryParams(options?: ListFoldersOptions): URLSearchParams {
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
