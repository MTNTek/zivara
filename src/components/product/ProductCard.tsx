'use client';

import Link from 'next/link';
import Image from 'next/image';
import { WishlistButton } from './wishlist-button';
import { QuickViewButton } from './quick-view-button';
import { CompareButton } from './compare-button';
import { PriceHistoryHint } from './price-history-hint';

interface ProductCardProps {
  id: string;
  name: string;
  price: string;
  discountPrice?: string | null;
  imageUrl?: string;
  averageRating?: string | null;
  reviewCount?: number;
  stock?: number;
  isWishlisted?: boolean;
  supplierLabel?: string | null;
  supplierUnavailable?: boolean;
  badge?: 'bestseller' | 'new' | 'deal' | null;
  /** Optional query string appended to the product link, e.g. "from=deals" */
  linkQuery?: string;
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
  isWishlisted,
  supplierLabel,
  supplierUnavailable,
  badge,
  linkQuery,
}: ProductCardProps) {

  const discountPercentage = discountPrice
    ? Math.round(((Number(price) - Number(discountPrice)) / Number(price)) * 100)
    : 0;

  const rating = averageRating ? Number(averageRating) : 0;
  const displayPrice = discountPrice || price;
  const dollars = Math.floor(Number(displayPrice));
  const cents = Math.round((Number(displayPrice) - dollars) * 100).toString().padStart(2, '0');

  return (
    <div className="relative group transition-transform duration-200 hover:-translate-y-1">
      {/* Wishlist Button */}
      <div className="absolute top-1 right-1 z-10">
        <WishlistButton productId={id} initialWishlisted={isWishlisted} />
      </div>

      <Link href={`/products/${id}${linkQuery ? `?${linkQuery}` : ''}`} className="block">
        {/* Image — square, white bg, object-contain like Amazon */}
        <div className="relative aspect-square bg-white overflow-hidden mb-2 rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200">
          {badge && (
            <span className={`absolute top-1.5 left-1.5 z-10 text-[10px] font-bold px-2 py-0.5 rounded-sm ${
              badge === 'bestseller' ? 'bg-blue-800 text-white' :
              badge === 'new' ? 'bg-[#2563eb] text-white' :
              badge === 'deal' ? 'bg-[#CC0C39] text-white' : ''
            }`}>
              {badge === 'bestseller' ? 'Best Seller' : badge === 'new' ? 'New' : badge === 'deal' ? 'Deal' : ''}
            </span>
          )}
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-300">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <QuickViewButton product={{ id, name, price, discountPrice, imageUrl, averageRating, reviewCount }} />
        </div>

        {/* Product info */}
        <div className="px-0.5">
          {/* Title — Amazon uses ~13px, 2-line clamp, #0F1111 */}
          <h3 className="text-[13px] leading-[18px] text-[#0F1111] line-clamp-2 mb-0.5 min-h-[36px]">
            {name}
          </h3>

          {/* Rating */}
          {rating > 0 && (
            <div className="flex items-center gap-1 mb-0.5">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg
                    key={s}
                    className="w-[15px] h-[15px]"
                    viewBox="0 0 24 24"
                    fill={s <= Math.round(rating) ? '#de7921' : 'none'}
                    stroke="#de7921"
                    strokeWidth={s <= Math.round(rating) ? 0 : 2}
                  >
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                ))}
              </div>
              <span className="text-[12px] text-[#2563eb]">{reviewCount || 0}</span>
            </div>
          )}

          {/* Price — Amazon style: $XX.XX with superscript $ and cents */}
          <div className="mt-0.5">
            {discountPrice ? (
              <>
                <div className="flex items-baseline gap-1">
                  <span className="text-[12px] text-[#CC0C39] font-medium">-{discountPercentage}%</span>
                  <span className="text-[#0F1111]">
                    <sup className="text-[12px] font-medium" style={{ top: '-0.5em' }}>$</sup>
                    <span className="text-[21px] font-light">{dollars}</span>
                    <sup className="text-[12px] font-medium" style={{ top: '-0.5em' }}>{cents}</sup>
                  </span>
                </div>
                <div className="text-[12px] text-[#565959]">
                  List: <span className="line-through">${Number(price).toFixed(2)}</span>
                </div>
              </>
            ) : (
              <span className="text-[#0F1111]">
                <sup className="text-[12px] font-medium" style={{ top: '-0.5em' }}>$</sup>
                <span className="text-[21px] font-light">{dollars}</span>
                <sup className="text-[12px] font-medium" style={{ top: '-0.5em' }}>{cents}</sup>
              </span>
            )}
          </div>

          {/* Delivery text */}
          <p className="text-[12px] text-[#565959] mt-0.5">FREE delivery</p>

          {/* Price history hint */}
          {discountPercentage >= 15 && <PriceHistoryHint discountPct={discountPercentage} />}

          {/* Supplier attribution */}
          {supplierLabel && (
            <p className="text-[11px] text-[#565959] mt-0.5">
              Fulfilled by <span className="text-[#2563eb]">{supplierLabel}</span>
            </p>
          )}

          {/* Supplier unavailable */}
          {supplierUnavailable && (
            <p className="text-[12px] text-orange-600 font-medium mt-0.5">Temporarily unavailable</p>
          )}

          {/* Stock */}
          {stock !== undefined && stock <= 0 && (
            <p className="text-[12px] text-red-600 mt-0.5">Currently unavailable</p>
          )}
          {stock !== undefined && stock > 0 && stock <= 5 && (
            <p className="text-[12px] text-orange-600 mt-0.5">Only {stock} left in stock</p>
          )}

          {/* Compare */}
          <div className="mt-1.5" onClick={(e) => e.preventDefault()}>
            <CompareButton product={{ id, name, price, discountPrice: discountPrice || null, imageUrl }} />
          </div>
        </div>
      </Link>
    </div>
  );
}
