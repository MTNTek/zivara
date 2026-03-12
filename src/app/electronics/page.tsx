'use client';

import { useState } from 'react';
import { CategoryHeader } from '@/components/category/CategoryHeader';
import { FiltersSidebar } from '@/components/category/FiltersSidebar';
import { CategoryProductCard } from '@/components/category/CategoryProductCard';
import { ProductSkeletonGrid } from '@/components/category/ProductSkeleton';

// Mock data - replace with API call later
const subcategories = [
  { name: 'Mobiles', icon: '📱', href: '/electronics/mobiles' },
  { name: 'Laptops', icon: '💻', href: '/electronics/laptops' },
  { name: 'Headphones', icon: '🎧', href: '/electronics/headphones' },
  { name: 'Cameras', icon: '📷', href: '/electronics/cameras' },
  { name: 'Gaming', icon: '🎮', href: '/electronics/gaming' },
  { name: 'Tablets', icon: '📱', href: '/electronics/tablets' },
  { name: 'Smartwatches', icon: '⌚', href: '/electronics/smartwatches' },
  { name: 'Accessories', icon: '🔌', href: '/electronics/accessories' },
];

const mockProducts = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max 256GB Natural Titanium',
    image: 'https://placehold.co/400x400/032854/white?text=iPhone+15+Pro',
    price: 1199.99,
    originalPrice: 1299.99,
    discount: 8,
    rating: 4.8,
    reviewCount: 1250,
    badge: 'bestseller' as const,
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24 Ultra 512GB Titanium Gray',
    image: 'https://placehold.co/400x400/124179/white?text=Galaxy+S24',
    price: 1099.99,
    originalPrice: 1299.99,
    discount: 15,
    rating: 4.7,
    reviewCount: 890,
    badge: 'new' as const,
  },
  {
    id: '3',
    name: 'MacBook Pro 16" M3 Pro Chip 18GB RAM 512GB SSD',
    image: 'https://placehold.co/400x400/032854/white?text=MacBook+Pro',
    price: 2499.99,
    originalPrice: 2699.99,
    discount: 7,
    rating: 4.9,
    reviewCount: 2100,
    badge: 'bestseller' as const,
  },
  {
    id: '4',
    name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    image: 'https://placehold.co/400x400/124179/white?text=Sony+XM5',
    price: 349.99,
    originalPrice: 399.99,
    discount: 13,
    rating: 4.6,
    reviewCount: 1580,
    badge: 'express' as const,
  },
  {
    id: '5',
    name: 'Dell XPS 15 Intel Core i7 16GB RAM 1TB SSD',
    image: 'https://placehold.co/400x400/032854/white?text=Dell+XPS',
    price: 1699.99,
    originalPrice: 1899.99,
    discount: 11,
    rating: 4.5,
    reviewCount: 670,
    badge: null,
  },
  {
    id: '6',
    name: 'Canon EOS R6 Mark II Mirrorless Camera Body',
    image: 'https://placehold.co/400x400/124179/white?text=Canon+R6',
    price: 2499.99,
    rating: 4.8,
    reviewCount: 340,
    badge: 'new' as const,
  },
  {
    id: '7',
    name: 'Apple AirPods Pro 2nd Generation with MagSafe',
    image: 'https://placehold.co/400x400/032854/white?text=AirPods+Pro',
    price: 249.99,
    originalPrice: 279.99,
    discount: 11,
    rating: 4.7,
    reviewCount: 3200,
    badge: 'bestseller' as const,
  },
  {
    id: '8',
    name: 'iPad Pro 12.9" M2 Chip 256GB WiFi Space Gray',
    image: 'https://placehold.co/400x400/124179/white?text=iPad+Pro',
    price: 1099.99,
    originalPrice: 1199.99,
    discount: 8,
    rating: 4.8,
    reviewCount: 1890,
    badge: 'express' as const,
  },
];

export default function ElectronicsPage() {
  const [sortBy, setSortBy] = useState('popularity');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const productsPerPage = 12;

  const totalPages = Math.ceil(mockProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const displayedProducts = mockProducts.slice(startIndex, startIndex + productsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Category Header */}
        <CategoryHeader title="Electronics" subcategories={subcategories} />

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className="hidden lg:block flex-shrink-0">
            <FiltersSidebar />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Sorting Bar */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {startIndex + 1}-{Math.min(startIndex + productsPerPage, mockProducts.length)} of {mockProducts.length} products
              </p>
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="text-sm text-gray-600">
                  Sort by:
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="popularity">Popularity</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {isLoading ? (
              <ProductSkeletonGrid count={productsPerPage} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                {displayedProducts.map((product) => (
                  <CategoryProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 border rounded-lg text-sm ${
                      currentPage === i + 1
                        ? 'bg-[#032854] text-white border-[#032854]'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>

        {/* Mobile Filter Button */}
        <button className="lg:hidden fixed bottom-4 right-4 bg-[#032854] text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </button>
      </div>
    </div>
  );
}
