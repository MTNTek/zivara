'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

export function SortDropdown({ currentSort }: { currentSort?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('sortBy', value);
    } else {
      params.delete('sortBy');
    }
    params.delete('page');
    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  };

  return (
    <select
      value={currentSort || ''}
      onChange={(e) => handleChange(e.target.value)}
      disabled={isPending}
      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
      aria-label="Sort products"
    >
      <option value="">Sort: Default</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
      <option value="rating">Highest Rated</option>
      <option value="newest">Newest First</option>
    </select>
  );
}
