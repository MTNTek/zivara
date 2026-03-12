'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  badge?: 'bestseller' | 'new' | 'express' | null;
}

interface CategoryProductCardProps {
  product: Product;
}

export function CategoryProductCard({ product }: CategoryProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAdding(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsAdding(false);
    // Show success toast
  };

  const getBadgeStyles = (badge: string) => {
    switch (badge) {
      case 'bestseller':
        return 'bg-yellow-500 text-white';
      case 'new':
        return 'bg-green-500 text-white';
      case 'express':
        return 'bg-blue-500 text-white';
      default:
        return '';
    }
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 group relative"
      onMouseEnter={() => setShowQuickAdd(true)}
      onMouseLeave={() => setShowQuickAdd(false)}
    >
      <Link href={`/products/${product.id}`} className="block relative">
        {/* Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {product.badge && (
            <span className={`${getBadgeStyles(product.badge)} px-2 py-1 rounded text-xs font-bold uppercase`}>
              {product.badge}
            </span>
          )}
          {product.discount && (
            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
              {product.discount}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsWishlisted(!isWishlisted);
          }}
          className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-all hover:scale-110"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg
            className={`w-5 h-5 transition-colors ${isWishlisted ? 'text-red-500 fill-current' : 'text-gray-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        {/* Product Image */}
        <div className="relative h-56 bg-gray-50 overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Quick View Overlay */}
          <div className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center ${showQuickAdd ? 'opacity-100' : 'opacity-0'}`}>
            <button
              onClick={(e) => {
                e.preventDefault();
                // Open quick view modal
              }}
              className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300"
            >
              Quick View
            </button>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-sm text-gray-800 mb-2 line-clamp-2 hover:text-[#0018f9] transition-colors min-h-[40px] font-medium">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.reviewCount})</span>
        </div>

        {/* Price */}
        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          {product.originalPrice && (
            <span className="text-xs text-green-600 font-medium">
              Save ${(product.originalPrice - product.price).toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className={`w-full bg-[#032854] text-white py-2.5 rounded-lg hover:bg-[#021d3d] transition-all text-sm font-medium flex items-center justify-center gap-2 ${
            isAdding ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-lg transform hover:-translate-y-0.5'
          }`}
        >
          {isAdding ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Adding...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Add to Cart
            </>
          )}
        </button>

        {/* Express Delivery Badge */}
        <div className="mt-2 flex items-center gap-1 text-xs text-gray-600">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Express Delivery Available</span>
        </div>
      </div>
    </div>
  );
}
