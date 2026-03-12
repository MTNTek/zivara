'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

interface ProductSearchProps {
  initialSearch: string;
}

export function ProductSearch({ initialSearch }: ProductSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (search) {
        params.set('search', search);
      } else {
        params.delete('search');
      }
      params.delete('page'); // Reset to page 1 on new search
      
      router.push(`/admin/products?${params.toString()}`);
    });
  };

  const handleClear = () => {
    setSearch('');
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      params.delete('search');
      params.delete('page');
      router.push(`/admin/products?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by product name or SKU..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
      >
        {isPending ? 'Searching...' : 'Search'}
      </button>
      {search && (
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          Clear
        </button>
      )}
    </form>
  );
}
