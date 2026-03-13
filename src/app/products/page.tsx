import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getProducts, getCategories } from '@/features/products/cached-queries';
import { ProductGrid } from '@/components/product/product-grid';
import { ProductFilters } from '@/components/product/product-filters';
import { Pagination } from '@/components/ui/pagination';
import { MobileFilters } from '@/components/product/mobile-filters';
import { SortDropdown } from '@/components/product/sort-dropdown';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { getWishlistProductIds } from '@/features/wishlist/actions';

export const metadata: Metadata = {
  title: 'Products - Zivara',
  description: 'Browse our collection of quality products. Find electronics, clothing, home goods, and more at great prices.',
};

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    categoryId?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    sortBy?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = 24;

  // Resolve category slug to ID if needed
  let categoryId = params.categoryId;
  if (!categoryId && params.category) {
    const allCategories = await getCategories();
    const match = allCategories.find(
      (c) => c.slug === params.category || c.slug.startsWith(params.category!)
    );
    if (match) {
      categoryId = match.id;
    }
  }

  // Build query parameters
  const queryParams = {
    page,
    limit,
    search: params.search,
    categoryId,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    minRating: params.minRating ? Number(params.minRating) : undefined,
    sortBy: params.sortBy as 'price-asc' | 'price-desc' | 'rating' | 'newest' | undefined,
  };

  const [{ products, total }, categories, wishlistedIds] = await Promise.all([
    getProducts(queryParams),
    getCategories(),
    getWishlistProductIds(),
  ]);

  const totalPages = Math.ceil(total / limit);

  const currentFilters = {
    categoryId,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    minRating: params.minRating ? Number(params.minRating) : undefined,
    sortBy: params.sortBy,
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: 'Products' }]} />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
              <Suspense fallback={<div>Loading filters...</div>}>
                <ProductFilters
                  categories={categories}
                  currentFilters={currentFilters}
                />
              </Suspense>
            </div>
          </aside>

          {/* Mobile Filters Button */}
          <div className="lg:hidden">
            <MobileFilters categories={categories} currentFilters={currentFilters} />
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between">
                <p className="text-gray-600 text-sm sm:text-base">
                  Showing {products.length > 0 ? (page - 1) * limit + 1 : 0} -{' '}
                  {Math.min(page * limit, total)} of {total} products
                </p>
                <SortDropdown currentSort={params.sortBy} />
              </div>
            </div>

            {/* Products */}
            {products.length > 0 ? (
              <>
                <ProductGrid products={products} wishlistedIds={wishlistedIds} />
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination currentPage={page} totalPages={totalPages} />
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your filters or search terms
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
