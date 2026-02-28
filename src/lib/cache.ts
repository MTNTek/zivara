import { unstable_cache, revalidateTag } from 'next/cache';

/**
 * Cache tags for different data types
 */
export const CACHE_TAGS = {
  PRODUCTS: 'products',
  PRODUCT: (id: string) => `product:${id}`,
  CATEGORIES: 'categories',
  CATEGORY: (id: string) => `category:${id}`,
  PRODUCT_SEARCH: 'product-search',
} as const;

/**
 * Cache revalidation times (in seconds)
 */
export const CACHE_TIMES = {
  PRODUCTS: 300, // 5 minutes
  CATEGORIES: 300, // 5 minutes
} as const;

/**
 * Invalidate product-related caches
 */
export function invalidateProductCache(productId?: string) {
  revalidateTag(CACHE_TAGS.PRODUCTS);
  revalidateTag(CACHE_TAGS.PRODUCT_SEARCH);
  if (productId) {
    revalidateTag(CACHE_TAGS.PRODUCT(productId));
  }
}

/**
 * Invalidate category-related caches
 */
export function invalidateCategoryCache(categoryId?: string) {
  revalidateTag(CACHE_TAGS.CATEGORIES);
  // Categories affect product listings, so invalidate those too
  revalidateTag(CACHE_TAGS.PRODUCTS);
  revalidateTag(CACHE_TAGS.PRODUCT_SEARCH);
  if (categoryId) {
    revalidateTag(CACHE_TAGS.CATEGORY(categoryId));
  }
}

/**
 * Create a cached version of a function with tags
 */
export function createCachedFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    tags: string[];
    revalidate: number;
    keyPrefix: string;
  }
): T {
  return ((...args: Parameters<T>) => {
    // Create a unique cache key based on function arguments
    const cacheKey = `${options.keyPrefix}:${JSON.stringify(args)}`;
    
    return unstable_cache(
      async () => fn(...args),
      [cacheKey],
      {
        tags: options.tags,
        revalidate: options.revalidate,
      }
    )();
  }) as T;
}
