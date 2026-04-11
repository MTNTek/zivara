/**
 * Cached versions of product and category queries
 * Uses Next.js unstable_cache with 5-minute revalidation
 */

import { unstable_cache } from 'next/cache';
import { CACHE_TAGS, CACHE_TIMES } from '@/lib/cache';
import {
  getProducts as getProductsUncached,
  getProductById as getProductByIdUncached,
  getProductBySlug as getProductBySlugUncached,
  getProductsByCategory as getProductsByCategoryUncached,
  getCategories as getCategoriesUncached,
  getCategoryById as getCategoryByIdUncached,
  getCategoryBySlug as getCategoryBySlugUncached,
  getCategoryHierarchy as getCategoryHierarchyUncached,
} from './queries';
import type { ProductQueryParams } from '@/types';

/**
 * Cached version of getProducts
 * Cache key includes all query parameters for proper cache segmentation
 */
export async function getProducts(params: ProductQueryParams = {}) {
  const cacheKey = `products:${JSON.stringify(params)}`;
  
  return unstable_cache(
    async () => getProductsUncached(params),
    [cacheKey],
    {
      tags: [CACHE_TAGS.PRODUCTS, CACHE_TAGS.PRODUCT_SEARCH],
      revalidate: CACHE_TIMES.PRODUCTS,
    }
  )();
}

/**
 * Cached version of getProductById
 */
export async function getProductById(id: string) {
  return unstable_cache(
    async () => getProductByIdUncached(id),
    [`product:${id}`],
    {
      tags: [CACHE_TAGS.PRODUCTS, CACHE_TAGS.PRODUCT(id)],
      revalidate: CACHE_TIMES.PRODUCTS,
    }
  )();
}

/**
 * Cached version of getProductBySlug
 */
export async function getProductBySlug(slug: string) {
  return unstable_cache(
    async () => getProductBySlugUncached(slug),
    [`product-slug:${slug}`],
    {
      tags: [CACHE_TAGS.PRODUCTS],
      revalidate: CACHE_TIMES.PRODUCTS,
    }
  )();
}

/**
 * Cached version of getProductsByCategory
 */
export async function getProductsByCategory(
  categoryId: string,
  params: {
    page?: number;
    limit?: number;
    sortBy?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    search?: string;
    subcategorySlugs?: string[];
  } = {}
) {
  const cacheKey = `products-category:${categoryId}:${JSON.stringify(params)}`;
  
  return unstable_cache(
    async () => getProductsByCategoryUncached(categoryId, params),
    [cacheKey],
    {
      tags: [
        CACHE_TAGS.PRODUCTS,
        CACHE_TAGS.CATEGORIES,
        CACHE_TAGS.CATEGORY(categoryId),
        CACHE_TAGS.PRODUCT_SEARCH,
      ],
      revalidate: CACHE_TIMES.PRODUCTS,
    }
  )();
}

/**
 * Cached version of getCategories
 */
export async function getCategories() {
  return unstable_cache(
    async () => getCategoriesUncached(),
    ['categories:all'],
    {
      tags: [CACHE_TAGS.CATEGORIES],
      revalidate: CACHE_TIMES.CATEGORIES,
    }
  )();
}

/**
 * Cached version of getCategoryById
 */
export async function getCategoryById(id: string) {
  return unstable_cache(
    async () => getCategoryByIdUncached(id),
    [`category:${id}`],
    {
      tags: [CACHE_TAGS.CATEGORIES, CACHE_TAGS.CATEGORY(id)],
      revalidate: CACHE_TIMES.CATEGORIES,
    }
  )();
}

/**
 * Cached version of getCategoryBySlug
 */
export async function getCategoryBySlug(slug: string) {
  return unstable_cache(
    async () => getCategoryBySlugUncached(slug),
    [`category-slug:${slug}`],
    {
      tags: [CACHE_TAGS.CATEGORIES],
      revalidate: CACHE_TIMES.CATEGORIES,
    }
  )();
}

/**
 * Cached version of getCategoryHierarchy
 */
export async function getCategoryHierarchy() {
  return unstable_cache(
    async () => getCategoryHierarchyUncached(),
    ['category-hierarchy'],
    {
      tags: [CACHE_TAGS.CATEGORIES],
      revalidate: CACHE_TIMES.CATEGORIES,
    }
  )();
}
