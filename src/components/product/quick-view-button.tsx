'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface QuickViewProps {
  product: {
    id: string;
    name: string;
    price: string;
    discountPrice?: string | null;
    imageUrl?: string;
    averageRating?: string | null;
    reviewCount?: number;
    description?: string;
  };
}

export function QuickViewButton({ product }: QuickViewProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Close on Escape + lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const rating = product.averageRating ? Number(product.averageRating) : 0;
  const displayPrice = product.discountPrice || product.price;
  const discountPct = product.discountPrice
    ? Math.round(((Number(product.price) - Number(product.discountPrice)) / Number(product.price)) * 100)
    : 0;

  return (
    <>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(true); }}
        className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/95 text-[#0F1111] text-xs font-medium px-3 py-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10"
        aria-label={`Quick view ${product.name}`}
      >
        Quick Look
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
          <div className="fixed inset-0 bg-black/50" />
          <div
            className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 z-10 text-gray-400 hover:text-gray-600 p-1"
              aria-label="Close quick view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col sm:flex-row gap-4 p-5">
              {/* Image */}
              <div className="relative w-full sm:w-48 h-48 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-contain p-2"
                    sizes="192px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-[#0F1111] line-clamp-2 mb-2">{product.name}</h3>

                {rating > 0 && (
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex text-[#de7921]">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <svg key={s} className="w-3.5 h-3.5" fill={s <= Math.round(rating) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-[#2563eb]">{product.reviewCount || 0}</span>
                  </div>
                )}

                <div className="mb-3">
                  {product.discountPrice ? (
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white bg-[#CC0C39] px-1.5 py-0.5 rounded font-medium">-{discountPct}%</span>
                        <span className="text-xl font-light text-[#0F1111]">${Number(product.discountPrice).toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-[#565959]">List: <span className="line-through">${Number(product.price).toFixed(2)}</span></p>
                    </div>
                  ) : (
                    <span className="text-xl font-light text-[#0F1111]">${Number(displayPrice).toFixed(2)}</span>
                  )}
                </div>

                <p className="text-xs text-[#565959] mb-4">
                  <span className="text-[#2563eb]">FREE delivery</span>{' '}
                  {new Date(Date.now() + 5 * 86400000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>

                <Link
                  href={`/products/${product.id}`}
                  onClick={() => setIsOpen(false)}
                  className="block w-full bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0F1111] text-sm font-medium text-center px-4 py-2.5 rounded-full transition-colors"
                >
                  View Full Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
