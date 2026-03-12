'use client';

import Link from 'next/link';
import { useState } from 'react';

interface Category {
  name: string;
  href: string;
}

const categories: Category[] = [
  { name: 'Electronics', href: '/products/category/electronics' },
  { name: "Men's Fashion", href: '/products/category/mens-fashion' },
  { name: "Women's Fashion", href: '/products/category/womens-fashion' },
  { name: 'Home & Kitchen', href: '/products/category/home-kitchen' },
  { name: 'Beauty & Health', href: '/products/category/beauty-health' },
  { name: 'Sports & Outdoors', href: '/products/category/sports-outdoors' },
  { name: 'Toys & Games', href: '/products/category/toys-games' },
  { name: 'Books', href: '/products/category/books' },
  { name: 'Automotive', href: '/products/category/automotive' },
  { name: 'Pet Supplies', href: '/products/category/pet-supplies' },
  { name: 'Office Products', href: '/products/category/office-products' },
  { name: 'Garden', href: '/products/category/garden' },
];

export function MegaMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* All Button - Amazon Style */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-white px-3 py-1 transition-colors font-bold"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        All
      </button>

      {/* Dropdown Menu - Amazon Style */}
      {isOpen && (
        <>
          {/* Invisible overlay to close menu when clicking outside */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute left-0 top-full mt-0 bg-white shadow-lg z-50 w-64 border border-gray-200">
            <div className="py-2">
              <div className="px-4 py-3 font-bold text-gray-900 border-b border-gray-200">
                Shop by Department
              </div>
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {category.name}
                </Link>
              ))}
              <div className="border-t border-gray-200 mt-2">
                <Link
                  href="/products"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors font-semibold"
                >
                  See All Categories
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
