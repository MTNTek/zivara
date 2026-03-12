'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface ProductCardProps {
  id: string;
  name: string;
  price: string;
  discountPrice?: string | null;
  imageUrl?: string;
  averageRating?: string | null;
  reviewCount?: number;
  stock?: number;
}

export function ProductCard({
  id,
  name,
  price,
  discountPrice,
  imageUrl,
  averageRating,
  reviewCount,
  stock,
}: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAdding(true);
    
    // Simulate add to cart
    await new Promise(resolve => setTimeout(resolve, 600));
    
    setIsAdding(false);
    setShowSuccess(true);
    
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const discountPercentage = discountPrice
    ? Math.round(((Number(price) - Number(discountPrice)) / Number(price)) * 100)
    : 0;

  const rating = averageRating ? Number(averageRating) : 0;

  return (
    <Link
      href={`/products/${id}`}
      className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* Discount Badge */}
      {discountPercentage > 0 && (
        <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
          -{discountPercentage}%
        </div>
      )}

      {/* Success Badge */}
      {showSuccess && (
        <div className="absolute top-2 right-2 z-10 bg-green-500 text-white px-3 py-1 rounded text-xs font-bold animate-slideInRight">
          ✓ Added!
        </div>
      )}

      {/* Image Container with Zoom Effect */}
      <div className="relative w-full h-48 bg-gray-50 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No Image
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className="text-sm text-gray-900 mb-2 line-clamp-2 group-hover:text-[#14B8A6] transition-colors min-h-[40px]">
          {name}
        </h3>

        {/* Star Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex text-[#14B8A6]">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className="w-4 h-4"
                  fill={star <= Math.floor(rating) ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-600">
              ({reviewCount || 0})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="mb-3">
          {discountPrice ? (
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-red-600">
                ${Number(discountPrice).toFixed(2)}
              </span>
              <span className="text-sm text-gray-500 line-through">
                ${Number(price).toFixed(2)}
              </span>
            </div>
          ) : (
            <span className="text-xl font-bold text-gray-900">
              ${Number(price).toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {stock !== undefined && (
          <p className={`text-xs mb-3 ${stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stock > 0 ? `In Stock (${stock})` : 'Out of Stock'}
          </p>
        )}

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding || !stock || stock <= 0}
          className={`w-full py-2 px-4 rounded font-medium transition-all duration-300 ${
            isAdding
              ? 'bg-gray-400 cursor-wait'
              : stock && stock > 0
              ? 'bg-[#14B8A6] hover:bg-[#0d9488] text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          } ${isAdding ? 'animate-pulse' : ''}`}
        >
          {isAdding ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Adding...
            </span>
          ) : showSuccess ? (
            '✓ Added to Cart'
          ) : stock && stock > 0 ? (
            'Add to Cart'
          ) : (
            'Out of Stock'
          )}
        </button>
      </div>
    </Link>
  );
}
