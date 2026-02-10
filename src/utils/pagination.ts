import { GammaError } from '../errors/index.js';

/**
 * Represents a paginated response from the API.
 */
export interface PaginatedResponse<T> {
  /** Array of items for the current page */
  data: T[];
  /** Whether there are more pages available */
  hasMore: boolean;
  /** Cursor for fetching the next page, null if no more pages */
  nextCursor: string | null;
}

/**
 * Function type for fetching a page of results.
 */
export type PageFetcher<T> = (
  cursor?: string
) => Promise<PaginatedResponse<T>>;

/**
 * Options for configuring the paginator.
 */
export interface PaginatorOptions {
  /** AbortSignal for cancelling pagination */
  signal?: AbortSignal | undefined;
}

/**
 * Paginator interface for iterating over paginated results.
 */
export interface Paginator<T> extends AsyncIterable<PaginatedResponse<T>> {
  /**
   * Returns an async iterable that yields individual items across all pages.
   */
  items(): AsyncIterable<T>;

  /**
   * Collects all items from all pages into a single array.
   * Use with caution for large datasets as it loads everything into memory.
   *
   * @param maxItems - Optional maximum number of items to collect.
   *   When specified, iteration stops after collecting this many items.
   */
  toArray(maxItems?: number): Promise<T[]>;
}

/**
 * Creates a paginator for iterating over paginated API results.
 *
 * @param fetcher - Function to fetch a page of results given an optional cursor
 * @returns A Paginator that can be used to iterate over pages or items
 *
 * @example
 * // Iterate over pages
 * const paginator = createPaginator(cursor => client.themes.list({ after: cursor }));
 * for await (const page of paginator) {
 *   console.log(`Got ${page.data.length} items`);
 * }
 *
 * @example
 * // Iterate over individual items
 * for await (const item of paginator.items()) {
 *   console.log(item.name);
 * }
 *
 * @example
 * // Collect all items
 * const allItems = await paginator.toArray();
 */
export function createPaginator<T>(
  fetcher: PageFetcher<T>,
  options?: PaginatorOptions
): Paginator<T> {
  const signal = options?.signal;

  /**
   * Async generator that yields pages of results.
   */
  async function* pageGenerator(): AsyncGenerator<
    PaginatedResponse<T>,
    void,
    undefined
  > {
    let cursor: string | undefined = undefined;

    while (true) {
      if (signal?.aborted) {
        throw new GammaError('Pagination was cancelled', {
          code: 'PAGINATION_CANCELLED',
        });
      }

      const page = await fetcher(cursor);
      yield page;

      // Stop if there are no more pages
      if (!page.hasMore || page.nextCursor === null) {
        break;
      }

      cursor = page.nextCursor;
    }
  }

  /**
   * Async generator that yields individual items across all pages.
   */
  async function* itemGenerator(): AsyncGenerator<T, void, undefined> {
    for await (const page of pageGenerator()) {
      for (const item of page.data) {
        if (signal?.aborted) {
          throw new GammaError('Pagination was cancelled', {
            code: 'PAGINATION_CANCELLED',
          });
        }
        yield item;
      }
    }
  }

  /**
   * Collects all items from all pages into an array.
   */
  async function toArray(maxItems?: number): Promise<T[]> {
    const allItems: T[] = [];
    for await (const item of itemGenerator()) {
      allItems.push(item);
      if (maxItems !== undefined && allItems.length >= maxItems) {
        break;
      }
    }
    return allItems;
  }

  // Create the paginator object
  const paginator: Paginator<T> = {
    [Symbol.asyncIterator]: () => pageGenerator(),
    items: () => ({
      [Symbol.asyncIterator]: () => itemGenerator(),
    }),
    toArray,
  };

  return paginator;
}
