'use client';

import type { ProductWithImages } from '@/types';
import { ProductGrid } from './product-grid';
import { ProductListView } from './product-list-view';
import { ViewToggle, useViewMode } from './view-toggle';
import { SortDropdown } from './sort-dropdown';

interface ProductViewWrapperProps {
  products: ProductWithImages[];
  wishlistedIds: string[];
  total: number;
  page: number;
  limit: number;
  currentSort?: string;
  searchTerm?: string;
}

export function ProductViewWrapper({
  products,
  wishlistedIds,
  total,
  page,
  limit,
  currentSort,
  searchTerm,
}: ProductViewWrapperProps) {
  const [view, setView] = useViewMode();

  return (
    <>
      {/* Results Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <p className="text-gray-600 text-sm">
            {searchTerm ? (
              <>{(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total} results</>
            ) : (
              <>Showing {products.length > 0 ? (page - 1) * limit + 1 : 0}-{Math.min(page * limit, total)} of {total} products</>
            )}
          </p>
          <div className="flex items-center gap-3">
            <ViewToggle view={view} onChange={setView} />
            <SortDropdown currentSort={currentSort} />
          </div>
        </div>
      </div>

      {/* Products */}
      {view === 'grid' ? (
        <ProductGrid products={products} wishlistedIds={wishlistedIds} />
      ) : (
        <ProductListView products={products} wishlistedIds={wishlistedIds} />
      )}
    </>
  );
}
