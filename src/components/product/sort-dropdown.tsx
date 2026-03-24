'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTransition } from 'react';

export function SortDropdown({ currentSort }: { currentSort?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('sortBy', value);
    } else {
      params.delete('sortBy');
    }
    params.delete('page');
    const qs = params.toString();
    startTransition(() => {
      router.push(`${pathname}${qs ? `?${qs}` : ''}`);
    });
  };

  return (
    <select
      value={currentSort || ''}
      onChange={(e) => handleChange(e.target.value)}
      disabled={isPending}
      className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#2563eb] bg-white"
      aria-label="Sort products"
    >
      <option value="">Sort: Default</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
      <option value="rating">Highest Rated</option>
      <option value="newest">Newest First</option>
      <option value="bestselling">Best Selling</option>
    </select>
  );
}
