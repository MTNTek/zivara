import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getProducts, getCategories } from '@/features/products/cached-queries';
import { ProductViewWrapper } from '@/components/product/product-view-wrapper';
import { ProductFilters } from '@/components/product/product-filters';
import { Pagination } from '@/components/ui/pagination';
import { MobileFilters } from '@/components/product/mobile-filters';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { getWishlistProductIds } from '@/features/wishlist/actions';
import { BackToTop } from '@/components/ui/back-to-top';
import { ScrollRestore } from '@/components/ui/scroll-restore';
import { recordSearchQuery } from '@/features/search/actions';
import { ActiveFilters } from '@/components/product/active-filters';

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

  // Record search query for analytics (fire-and-forget)
  if (params.search) {
    recordSearchQuery(params.search, total);
  }

  const totalPages = Math.ceil(total / limit);

  const currentFilters = {
    categoryId,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    minRating: params.minRating ? Number(params.minRating) : undefined,
    sortBy: params.sortBy,
  };

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="px-4 sm:px-6 lg:px-10 py-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: 'Products' }]} />

        {/* Header */}
        <div className="mb-6">
          {params.search ? (
            <>
              <h1 className="text-xl font-bold text-[#0F1111]">
                Results for &ldquo;<span className="text-[#1d4ed8]">{params.search}</span>&rdquo;
              </h1>
              <p className="text-sm text-[#565959] mt-1">{total} result{total !== 1 ? 's' : ''}</p>
            </>
          ) : (
            <h1 className="text-2xl font-bold text-[#0F1111]">All Products</h1>
          )}
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
            {/* Active filter chips */}
            <Suspense fallback={null}>
              <ActiveFilters categories={categories} />
            </Suspense>

            {/* Products with view toggle */}
            {products.length > 0 ? (
              <>
                <ProductViewWrapper
                  products={products}
                  wishlistedIds={wishlistedIds}
                  total={total}
                  page={page}
                  limit={limit}
                  currentSort={params.sortBy}
                  searchTerm={params.search}
                />
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination currentPage={page} totalPages={totalPages} />
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {params.search ? `No results for "${params.search}"` : 'No products found'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {params.search
                    ? 'Check your spelling or try more general terms'
                    : 'Try adjusting your filters or browse a different category'}
                </p>
                {params.search && (
                  <div className="space-y-4">
                    <p className="text-sm text-[#565959]">Suggestions:</p>
                    <ul className="text-sm text-[#565959] space-y-1">
                      <li>• Check for typos or misspellings</li>
                      <li>• Use more general keywords</li>
                      <li>• Try fewer filters</li>
                    </ul>
                    <div className="flex flex-wrap justify-center gap-2 mt-4 pt-4 border-t border-gray-200">
                      {['Electronics', "Men's Fashion", "Women's Fashion", 'Home & Kitchen'].map((cat) => (
                        <a
                          key={cat}
                          href={`/products?search=${encodeURIComponent(cat)}`}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                        >
                          {cat}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <BackToTop />
      <ScrollRestore />
    </div>
  );
}
