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
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-[21px] font-bold text-[#0f1111]">{title}</h2>
        {seeMoreHref && (
          <Link href={seeMoreHref} className="text-[13px] text-[#007185] hover:text-[#c7511f] hover:underline">
            See more
          </Link>
        )}
      </div>

      {/* Scroll buttons — Amazon style tall narrow arrows */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 border border-gray-300 shadow-md rounded-r-sm w-[38px] h-[100px] flex items-center justify-center hover:bg-gray-50"
        aria-label="Scroll left"
      >
        <svg className="w-4 h-4 text-[#555]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 border border-gray-300 shadow-md rounded-l-sm w-[38px] h-[100px] flex items-center justify-center hover:bg-gray-50"
        aria-label="Scroll right"
      >
        <svg className="w-4 h-4 text-[#555]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-10"
      >
        {products.map((product) => {
          const rating = product.averageRating ? Number(product.averageRating) : 0;
          const hasDiscount = product.discountPrice && Number(product.discountPrice) < Number(product.price);
          const displayPrice = hasDiscount ? product.discountPrice! : product.price;
          const dollars = Math.floor(Number(displayPrice));
          const cents = Math.round((Number(displayPrice) - dollars) * 100).toString().padStart(2, '0');

          return (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="flex-shrink-0 w-[200px] group"
            >
              {/* Square image — Amazon uses ~200x200 white bg */}
              <div className="relative w-[200px] h-[200px] bg-white overflow-hidden mb-1">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300 text-xs">No Image</div>
                )}
              </div>

              <p className="text-[13px] leading-[18px] text-[#0f1111] line-clamp-2 group-hover:text-[#c7511f] transition-colors mb-0.5">
                {product.name}
              </p>

              {rating > 0 && (
                <div className="flex items-center gap-1 mb-0.5">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill={s <= Math.round(rating) ? '#de7921' : 'none'} stroke="#de7921" strokeWidth={s <= Math.round(rating) ? 0 : 2}>
                        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-[12px] text-[#007185]">{product.reviewCount || 0}</span>
                </div>
              )}

              <span className="text-[#0F1111]">
                <sup className="text-[11px] font-medium" style={{ top: '-0.5em' }}>$</sup>
                <span className="text-[21px] font-light">{dollars}</span>
                <sup className="text-[11px] font-medium" style={{ top: '-0.5em' }}>{cents}</sup>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
