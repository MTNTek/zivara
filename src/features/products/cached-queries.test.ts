import { describe, it, expect, vi, beforeEach } from 'vitest';
import { unstable_cache } from 'next/cache';

// Mock Next.js cache
vi.mock('next/cache', () => ({
  unstable_cache: vi.fn((fn) => fn),
  revalidateTag: vi.fn(),
}));

// Mock the queries module
vi.mock('./queries', () => ({
  getProducts: vi.fn(),
  getProductById: vi.fn(),
  getProductBySlug: vi.fn(),
  getProductsByCategory: vi.fn(),
  getCategories: vi.fn(),
  getCategoryById: vi.fn(),
  getCategoryBySlug: vi.fn(),
  getCategoryHierarchy: vi.fn(),
}));

describe('Cached Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Product Caching', () => {
    it('should use unstable_cache for getProducts', async () => {
      const { getProducts } = await import('./cached-queries');
      const mockUnstableCache = unstable_cache as unknown as ReturnType<typeof vi.fn>;
      
      await getProducts({ page: 1, limit: 24 });
      
      expect(mockUnstableCache).toHaveBeenCalled();
    });

    it('should use unstable_cache for getProductById', async () => {
      const { getProductById } = await import('./cached-queries');
      const mockUnstableCache = unstable_cache as unknown as ReturnType<typeof vi.fn>;
      
      await getProductById('test-id');
      
      expect(mockUnstableCache).toHaveBeenCalled();
    });

    it('should use unstable_cache for getProductBySlug', async () => {
      const { getProductBySlug } = await import('./cached-queries');
      const mockUnstableCache = unstable_cache as unknown as ReturnType<typeof vi.fn>;
      
      await getProductBySlug('test-slug');
      
      expect(mockUnstableCache).toHaveBeenCalled();
    });

    it('should use unstable_cache for getProductsByCategory', async () => {
      const { getProductsByCategory } = await import('./cached-queries');
      const mockUnstableCache = unstable_cache as unknown as ReturnType<typeof vi.fn>;
      
      await getProductsByCategory('category-id', { page: 1 });
      
      expect(mockUnstableCache).toHaveBeenCalled();
    });
  });

  describe('Category Caching', () => {
    it('should use unstable_cache for getCategories', async () => {
      const { getCategories } = await import('./cached-queries');
      const mockUnstableCache = unstable_cache as unknown as ReturnType<typeof vi.fn>;
      
      await getCategories();
      
      expect(mockUnstableCache).toHaveBeenCalled();
    });

    it('should use unstable_cache for getCategoryById', async () => {
      const { getCategoryById } = await import('./cached-queries');
      const mockUnstableCache = unstable_cache as unknown as ReturnType<typeof vi.fn>;
      
      await getCategoryById('test-id');
      
      expect(mockUnstableCache).toHaveBeenCalled();
    });

    it('should use unstable_cache for getCategoryBySlug', async () => {
      const { getCategoryBySlug } = await import('./cached-queries');
      const mockUnstableCache = unstable_cache as unknown as ReturnType<typeof vi.fn>;
      
      await getCategoryBySlug('test-slug');
      
      expect(mockUnstableCache).toHaveBeenCalled();
    });

    it('should use unstable_cache for getCategoryHierarchy', async () => {
      const { getCategoryHierarchy } = await import('./cached-queries');
      const mockUnstableCache = unstable_cache as unknown as ReturnType<typeof vi.fn>;
      
      await getCategoryHierarchy();
      
      expect(mockUnstableCache).toHaveBeenCalled();
    });
  });
});
