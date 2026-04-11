'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

export function UserSearch({ initialSearch = '' }: { initialSearch?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    
    // Reset to page 1 when searching
    params.set('page', '1');
    
    startTransition(() => {
      router.push(`/admin/users?${params.toString()}`);
    });
  };

  const handleClear = () => {
    setSearch('');
    const params = new URLSearchParams(searchParams);
    params.delete('search');
    params.set('page', '1');
    
    startTransition(() => {
      router.push(`/admin/users?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <div className="relative flex-1">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email or name..."
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F52BA] focus:border-transparent"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="px-6 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? 'Searching...' : 'Search'}
      </button>
      {search && (
        <button
          type="button"
          onClick={handleClear}
          disabled={isPending}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Clear
        </button>
      )}
    </form>
  );
}
