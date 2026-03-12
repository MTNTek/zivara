'use client';

import Link from 'next/link';
import { useRef } from 'react';

interface Subcategory {
  name: string;
  icon: string;
  href: string;
}

interface CategoryHeaderProps {
  title: string;
  subcategories: Subcategory[];
}

export function CategoryHeader({ title, subcategories }: CategoryHeaderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 mb-6">
      <div className="py-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
        
        {/* Subcategories Horizontal Scroll */}
        <div className="relative">
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:bg-gray-50"
            aria-label="Scroll left"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-8"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {subcategories.map((sub) => (
              <Link
                key={sub.name}
                href={sub.href}
                className="flex-shrink-0 flex flex-col items-center justify-center w-28 h-28 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <span className="text-3xl mb-2">{sub.icon}</span>
                <span className="text-xs text-center text-gray-700 font-medium px-2">
                  {sub.name}
                </span>
              </Link>
            ))}
          </div>

          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:bg-gray-50"
            aria-label="Scroll right"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
