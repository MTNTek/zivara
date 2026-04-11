'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface ActiveFiltersProps {
  categories: { id: string; name: string; slug: string }[];
}

export function ActiveFilters({ categories }: ActiveFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryId = searchParams.get('categoryId') || searchParams.get('category');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const minRating = searchParams.get('minRating');
  const sortBy = searchParams.get('sortBy');

  const chips: { label: string; key: string }[] = [];

  if (categoryId) {
    const cat = categories.find((c) => c.id === categoryId || c.slug === categoryId);
    chips.push({ label: cat?.name || categoryId, key: 'categoryId' });
  }
  if (minPrice) chips.push({ label: `Min $${minPrice}`, key: 'minPrice' });
  if (maxPrice) chips.push({ label: `Max $${maxPrice}`, key: 'maxPrice' });
  if (minRating) chips.push({ label: `${minRating}+ stars`, key: 'minRating' });
  if (sortBy) {
    const sortLabels: Record<string, string> = {
      'price-asc': 'Price: Low to High',
      'price-desc': 'Price: High to Low',
      rating: 'Top Rated',
      newest: 'Newest First',
    };
    chips.push({ label: sortLabels[sortBy] || sortBy, key: 'sortBy' });
  }

  if (chips.length === 0) return null;

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    if (key === 'categoryId') params.delete('category');
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  const clearAll = () => {
    const params = new URLSearchParams();
    const search = searchParams.get('search');
    if (search) params.set('search', search);
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-xs text-gray-500">Active filters:</span>
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={() => removeFilter(chip.key)}
          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full hover:bg-blue-100 transition-colors"
        >
          {chip.label}
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      ))}
      {chips.length > 1 && (
        <button
          onClick={clearAll}
          className="text-xs text-red-600 hover:text-red-800 underline ml-1"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
