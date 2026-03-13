import { describe, it, expect, vi, beforeEach } from 'vitest';
import { revalidateTag } from 'next/cache';

// Mock Next.js cache
vi.mock('next/cache', () => ({
  unstable_cache: vi.fn((fn) => fn),
  revalidateTag: vi.fn(),
}));

describe('Cache Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('invalidateProductCache', () => {
    it('should invalidate product-related cache tags', async () => {
      const { invalidateProductCache, CACHE_TAGS } = await import('./cache');
      const mockRevalidateTag = revalidateTag as unknown as ReturnType<typeof vi.fn>;
      
      invalidateProductCache('test-product-id');
      
      expect(mockRevalidateTag).toHaveBeenCalledWith(CACHE_TAGS.PRODUCTS);
      expect(mockRevalidateTag).toHaveBeenCalledWith(CACHE_TAGS.PRODUCT_SEARCH);
      expect(mockRevalidateTag).toHaveBeenCalledWith(CACHE_TAGS.PRODUCT('test-product-id'));
    });

    it('should invalidate general product caches without specific product ID', async () => {
      const { invalidateProductCache, CACHE_TAGS } = await import('./cache');
      const mockRevalidateTag = revalidateTag as unknown as ReturnType<typeof vi.fn>;
      
      invalidateProductCache();
      
      expect(mockRevalidateTag).toHaveBeenCalledWith(CACHE_TAGS.PRODUCTS);
      expect(mockRevalidateTag).toHaveBeenCalledWith(CACHE_TAGS.PRODUCT_SEARCH);
      expect(mockRevalidateTag).toHaveBeenCalledTimes(2);
    });
  });

  describe('invalidateCategoryCache', () => {
    it('should invalidate category-related cache tags', async () => {
      const { invalidateCategoryCache, CACHE_TAGS } = await import('./cache');
      const mockRevalidateTag = revalidateTag as unknown as ReturnType<typeof vi.fn>;
      
      invalidateCategoryCache('test-category-id');
      
      expect(mockRevalidateTag).toHaveBeenCalledWith(CACHE_TAGS.CATEGORIES);
      expect(mockRevalidateTag).toHaveBeenCalledWith(CACHE_TAGS.PRODUCTS);
      expect(mockRevalidateTag).toHaveBeenCalledWith(CACHE_TAGS.PRODUCT_SEARCH);
      expect(mockRevalidateTag).toHaveBeenCalledWith(CACHE_TAGS.CATEGORY('test-category-id'));
    });

    it('should invalidate general category caches without specific category ID', async () => {
      const { invalidateCategoryCache, CACHE_TAGS } = await import('./cache');
      const mockRevalidateTag = revalidateTag as unknown as ReturnType<typeof vi.fn>;
      
      invalidateCategoryCache();
      
      expect(mockRevalidateTag).toHaveBeenCalledWith(CACHE_TAGS.CATEGORIES);
      expect(mockRevalidateTag).toHaveBeenCalledWith(CACHE_TAGS.PRODUCTS);
      expect(mockRevalidateTag).toHaveBeenCalledWith(CACHE_TAGS.PRODUCT_SEARCH);
      expect(mockRevalidateTag).toHaveBeenCalledTimes(3);
    });
  });

  describe('CACHE_TIMES', () => {
    it('should have 5 minute (300 second) revalidation for products', async () => {
      const { CACHE_TIMES } = await import('./cache');
      
      expect(CACHE_TIMES.PRODUCTS).toBe(300);
    });

    it('should have 5 minute (300 second) revalidation for categories', async () => {
      const { CACHE_TIMES } = await import('./cache');
      
      expect(CACHE_TIMES.CATEGORIES).toBe(300);
    });
  });
});
