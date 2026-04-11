'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { ProductWithImages } from '@/types';
import { WishlistButton } from './wishlist-button';
import { CompareButton } from './compare-button';

interface ProductListViewProps {
  products: ProductWithImages[];
  wishlistedIds?: string[];
}

export function ProductListView({ products, wishlistedIds = [] }: ProductListViewProps) {
  return (
    <div className="space-y-3">
      {products.map((product) => {
        const isOutOfStock = product.inventory && product.inventory.quantity === 0;
        const discountPercentage = product.discountPrice
          ? Math.round(((Number(product.price) - Number(product.discountPrice)) / Number(product.price)) * 100)
          : 0;
        const rating = product.averageRating ? Number(product.averageRating) : 0;
        const displayPrice = Number(product.discountPrice || product.price);

        return (
          <div key={product.id} className="bg-white rounded-lg border border-gray-200 p-4 flex gap-4 hover:shadow-sm transition-shadow">
            {/* Image */}
            <Link href={`/products/${product.id}`} className="flex-shrink-0">
              <div className="relative w-[140px] h-[140px] sm:w-[180px] sm:h-[180px] bg-white rounded overflow-hidden">
                {product.images?.[0] ? (
                  <Image
                    src={product.images[0].imageUrl}
                    alt={product.images[0].altText || product.name}
                    fill
                    className="object-contain p-2"
                    loading="lazy"
                    sizes="180px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                    <span className="text-xs text-[#565959] font-medium">Unavailable</span>
                  </div>
                )}
              </div>
            </Link>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <Link href={`/products/${product.id}`}>
                <h3 className="text-[15px] text-[#0F1111] hover:text-[#1d4ed8] line-clamp-2 mb-1">
                  {product.name}
                </h3>
              </Link>

              {/* Rating */}
              {rating > 0 && (
                <div className="flex items-center gap-1 mb-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} className="w-4 h-4" viewBox="0 0 24 24" fill={s <= Math.round(rating) ? '#de7921' : 'none'} stroke="#de7921" strokeWidth={s <= Math.round(rating) ? 0 : 2}>
                        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-[#2563eb]">{product.reviewCount || 0}</span>
                </div>
              )}

              {/* Price */}
              <div className="mb-1">
                {product.discountPrice ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-medium text-[#0F1111]">${displayPrice.toFixed(2)}</span>
                    <span className="text-sm text-[#565959] line-through">${Number(product.price).toFixed(2)}</span>
                    <span className="text-sm text-[#CC0C39] font-medium">-{discountPercentage}%</span>
                  </div>
                ) : (
                  <span className="text-lg font-medium text-[#0F1111]">${displayPrice.toFixed(2)}</span>
                )}
              </div>

              <p className="text-xs text-[#565959]">FREE delivery</p>

              {/* Stock warning */}
              {product.inventory && product.inventory.quantity === 0 && (
                <p className="text-xs text-red-600 mt-0.5">Currently unavailable</p>
              )}
              {product.inventory && product.inventory.quantity > 0 && product.inventory.quantity <= 5 && (
                <p className="text-xs text-orange-600 mt-0.5">Only {product.inventory.quantity} left in stock</p>
              )}

              {product.description && (
                <p className="text-xs text-[#565959] mt-2 line-clamp-2 hidden sm:block">{product.description}</p>
              )}
            </div>

            {/* Wishlist & Compare */}
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              <WishlistButton productId={product.id} initialWishlisted={wishlistedIds.includes(product.id)} />
              <CompareButton product={{ id: product.id, name: product.name, price: product.price, discountPrice: product.discountPrice || null, imageUrl: product.images?.[0]?.imageUrl }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
