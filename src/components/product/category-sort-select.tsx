'use client';

interface CategorySortSelectProps {
  slug: string;
  currentSortBy?: string;
}

export function CategorySortSelect({ slug, currentSortBy }: CategorySortSelectProps) {
  return (
    <select
      id="sort"
      value={currentSortBy || ''}
      onChange={(e) => {
        const params = new URLSearchParams();
        if (e.target.value) {
          params.set('sortBy', e.target.value);
        }
        window.location.href = `/products/category/${slug}?${params.toString()}`;
      }}
      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F52BA]"
    >
      <option value="">Default</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
      <option value="rating">Highest Rated</option>
      <option value="newest">Newest First</option>
    </select>
  );
}
