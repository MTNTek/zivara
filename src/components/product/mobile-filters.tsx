'use client';

import { useState, useEffect, useRef } from 'react';
import { ProductFilters } from './product-filters';
import type { Category } from '@/types';

interface MobileFiltersProps {
  categories: Category[];
  currentFilters: {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sortBy?: string;
  };
}

export function MobileFilters({ categories, currentFilters }: MobileFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const activeFilterCount = [
    currentFilters.categoryId,
    currentFilters.minPrice,
    currentFilters.maxPrice,
    currentFilters.minRating,
  ].filter(Boolean).length;

  const open = () => {
    setIsOpen(true);
    requestAnimationFrame(() => setIsAnimating(true));
  };

  const close = () => {
    setIsAnimating(false);
    setTimeout(() => setIsOpen(false), 300);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Filter Button */}
      <button
        onClick={open}
        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 min-h-[44px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors mb-6"
        aria-label="Open filters"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span className="font-medium">Filters</span>
        {activeFilterCount > 0 && (
          <span className="bg-[#2563eb] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Mobile Filter Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black transition-opacity duration-300 ${isAnimating ? 'opacity-50' : 'opacity-0'}`}
            onClick={close}
            aria-hidden="true"
          />

          {/* Slide-in Panel */}
          <div
            ref={panelRef}
            className={`fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl flex flex-col transition-transform duration-300 ease-out ${isAnimating ? 'translate-x-0' : 'translate-x-full'}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button
                onClick={close}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-gray-700"
                aria-label="Close filters"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Filters Content */}
            <div className="flex-1 overflow-y-auto p-4 overscroll-contain">
              <ProductFilters
                categories={categories}
                currentFilters={currentFilters}
              />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={close}
                className="w-full bg-[#fbbf24] text-[#0F1111] px-6 py-3 min-h-[44px] rounded-full font-semibold hover:bg-[#f59e0b] transition-colors border border-[#FCD200]"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
