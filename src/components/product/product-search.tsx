'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ProductSearchProps {
  initialValue?: string;
}

export function ProductSearch({ initialValue = '' }: ProductSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialValue);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams(searchParams.toString());
    
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    
    // Reset to page 1 when searching
    params.delete('page');
    
    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  };

  const handleClear = () => {
    setSearch('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    params.delete('page');
    
    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full px-4 py-3 pl-12 pr-24 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
          disabled={isPending}
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {search && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-20 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            disabled={isPending}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#2563eb] text-white px-4 py-2 rounded-md hover:bg-[#1d4ed8] transition-colors disabled:opacity-50"
          disabled={isPending}
        >
          {isPending ? 'Searching...' : 'Search'}
        </button>
      </div>
    </form>
  );
}
