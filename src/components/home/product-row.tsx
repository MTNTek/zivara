'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ProductRowItem {
  id: string;
  name: string;
  price: string;
  discountPrice?: string | null;
  imageUrl?: string;
  averageRating?: string | null;
  reviewCount?: number;
}

interface ProductRowProps {
  title: string;
  products: ProductRowItem[];
  seeMoreHref?: string;
}

export function ProductRow({ title, products, seeMoreHref }: ProductRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: dir === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  if (products.length === 0) return null;

  return (
    <div className="bg-white p-5 relative">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-xl font-bold text-[#0f1111]">{title}</h2>
        {seeMoreHref && (
          <Link href={seeMoreHref} className="text-sm text-[#007185] hover:text-[#c7511f] hover:underline">
            See more
          </Link>
        )}
      </div>

      {/* Scroll buttons */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 shadow-md rounded-r-sm w-10 h-24 flex items-center justify-center hover:bg-gray-50 transition-colors"
        aria-label="Scroll left"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 shadow-md rounded-l-sm w-10 h-24 flex items-center justify-center hover:bg-gray-50 transition-colors"
        aria-label="Scroll right"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => {
          const rating = product.averageRating ? Number(product.averageRating) : 0;
          const hasDiscount = product.discountPrice && Number(product.discountPrice) < Number(product.price);
          const discountPct = hasDiscount
            ? Math.round(((Number(product.price) - Number(product.discountPrice)) / Number(product.price)) * 100)
            : 0;

          return (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="flex-shrink-0 w-[180px] group"
            >
              <div className="relative w-[180px] h-[180px] bg-gray-50 rounded overflow-hidden mb-2">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                    sizes="180px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Image</div>
                )}
                {discountPct > 0 && (
                  <span className="absolute top-1 left-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                    -{discountPct}%
                  </span>
                )}
              </div>
              <p className="text-sm text-[#0f1111] line-clamp-2 group-hover:text-[#c7511f] transition-colors leading-tight mb-1">
                {product.name}
              </p>
              {rating > 0 && (
                <div className="flex items-center gap-1 mb-1">
                  <div className="flex text-[#de7921]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} className="w-3.5 h-3.5" fill={s <= Math.floor(rating) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-[#007185]">{product.reviewCount || 0}</span>
                </div>
              )}
              <div>
                {hasDiscount ? (
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold text-[#0f1111]">${Number(product.discountPrice).toFixed(2)}</span>
                    <span className="text-xs text-gray-500 line-through">${Number(product.price).toFixed(2)}</span>
                  </div>
                ) : (
                  <span className="text-lg font-bold text-[#0f1111]">${Number(product.price).toFixed(2)}</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
