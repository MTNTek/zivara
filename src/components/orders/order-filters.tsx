'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const TIME_OPTIONS = [
  { value: '', label: 'All Time' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 3 months' },
  { value: '180', label: 'Last 6 months' },
  { value: '365', label: 'Last year' },
];

export function OrderFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const currentStatus = searchParams.get('status') || '';
  const currentDays = searchParams.get('days') || '';

  const updateParams = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.delete('page');
    router.push(`/orders?${params.toString()}`);
  }, [router, searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: search.trim() });
  };

  return (
    <div className="space-y-3 mb-4">
      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => updateParams({ status: tab.value })}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              currentStatus === tab.value
                ? 'bg-blue-800 text-white'
                : 'bg-white text-gray-700 border border-[#D5D9D9] hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search + time filter row */}
      <div className="bg-white rounded-lg shadow-sm p-3 flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by order number..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-[#D5D9D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent bg-white"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#565959]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>

        <select
          value={currentDays}
          onChange={e => updateParams({ days: e.target.value })}
          className="px-3 py-2 text-sm border border-[#D5D9D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] bg-white"
        >
          {TIME_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
