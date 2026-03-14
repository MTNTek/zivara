'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import type { Category } from '@/types';

interface ProductFiltersProps {
  categories: Category[];
  currentFilters: {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sortBy?: string;
  };
}

export function ProductFilters({ categories, currentFilters }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Reset to page 1 when filtering
    params.delete('page');
    
    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    const search = searchParams.get('search');
    if (search) {
      params.set('search', search);
    }
    
    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  };

  const hasFilters = currentFilters.categoryId || currentFilters.minPrice || 
                     currentFilters.maxPrice || currentFilters.minRating || 
                     currentFilters.sortBy;

  // Get top-level categories
  const topCategories = categories.filter(c => !c.parentId);

  return (
    <div className="space-y-6">
      {/* Clear Filters */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="w-full text-sm text-black hover:text-gray-700 font-medium py-3 min-h-[44px]"
          disabled={isPending}
        >
          Clear all filters
        </button>
      )}

      {/* Sort By */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Sort By</h3>
        <select
          value={currentFilters.sortBy || ''}
          onChange={(e) => updateFilter('sortBy', e.target.value || null)}
          className="w-full px-3 py-3 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F52BA] text-base"
          disabled={isPending}
        >
          <option value="">Default</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
          <option value="newest">Newest First</option>
        </select>
      </div>

      {/* Category */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
        <div className="space-y-3">
          <label className="flex items-center min-h-[44px]">
            <input
              type="radio"
              name="category"
              checked={!currentFilters.categoryId}
              onChange={() => updateFilter('categoryId', null)}
              className="w-5 h-5 accent-blue-800 focus:ring-[#0F52BA]"
              disabled={isPending}
            />
            <span className="ml-3 text-sm text-gray-700">All Categories</span>
          </label>
          {topCategories.map((category) => (
            <label key={category.id} className="flex items-center min-h-[44px]">
              <input
                type="radio"
                name="category"
                checked={currentFilters.categoryId === category.id}
                onChange={() => updateFilter('categoryId', category.id)}
                className="w-5 h-5 accent-blue-800 focus:ring-[#0F52BA]"
                disabled={isPending}
              />
              <span className="ml-3 text-sm text-gray-700">{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
        <div className="space-y-3">
          <input
            type="number"
            placeholder="Min price"
            value={currentFilters.minPrice || ''}
            onChange={(e) => updateFilter('minPrice', e.target.value || null)}
            className="w-full px-3 py-3 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F52BA] text-base"
            min="0"
            step="0.01"
            disabled={isPending}
          />
          <input
            type="number"
            placeholder="Max price"
            value={currentFilters.maxPrice || ''}
            onChange={(e) => updateFilter('maxPrice', e.target.value || null)}
            className="w-full px-3 py-3 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F52BA] text-base"
            min="0"
            step="0.01"
            disabled={isPending}
          />
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Minimum Rating</h3>
        <div className="space-y-3">
          {[4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center min-h-[44px]">
              <input
                type="radio"
                name="rating"
                checked={currentFilters.minRating === rating}
                onChange={() => updateFilter('minRating', rating.toString())}
                className="w-5 h-5 accent-blue-800 focus:ring-[#0F52BA]"
                disabled={isPending}
              />
              <span className="ml-3 text-sm text-gray-700 flex items-center">
                {[...Array(rating)].map((_, i) => (
                  <span key={i} className="text-[#14B8A6]">★</span>
                ))}
                <span className="ml-1">& up</span>
              </span>
            </label>
          ))}
          <label className="flex items-center min-h-[44px]">
            <input
              type="radio"
              name="rating"
              checked={!currentFilters.minRating}
              onChange={() => updateFilter('minRating', null)}
              className="w-5 h-5 accent-blue-800 focus:ring-[#0F52BA]"
              disabled={isPending}
            />
            <span className="ml-3 text-sm text-gray-700">All Ratings</span>
          </label>
        </div>
      </div>
    </div>
  );
}
