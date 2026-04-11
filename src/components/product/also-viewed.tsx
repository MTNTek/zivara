import { db } from '@/db';
import { products } from '@/db/schema';
import { and, eq, ne, sql, inArray } from 'drizzle-orm';
import Link from 'next/link';
import Image from 'next/image';

interface AlsoViewedProps {
  productId: string;
  categoryId: string;
}

export async function AlsoViewed({ productId, categoryId }: AlsoViewedProps) {
  // Get products from the same category, ordered by popularity (review count + random)
  const viewed = await db.query.products.findMany({
    where: and(
      eq(products.categoryId, categoryId),
      ne(products.id, productId),
      eq(products.isActive, true),
    ),
    with: { images: { limit: 1 }, inventory: true },
    orderBy: sql`${products.reviewCount} DESC NULLS LAST, RANDOM()`,
    limit: 8,
  });

  if (viewed.length < 2) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
      <h2 className="text-lg font-bold text-[#0f1111] mb-4">Customers who viewed this item also viewed</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
        {viewed.map((p) => {
          const price = Number(p.discountPrice || p.price);
          const dollars = Math.floor(price);
          const cents = Math.round((price - dollars) * 100).toString().padStart(2, '0');
          const rating = p.averageRating ? Number(p.averageRating) : 0;

          return (
            <Link
              key={p.id}
              href={`/products/${p.id}`}
              className="group flex-shrink-0 w-[160px]"
            >
              <div className="relative aspect-square bg-white rounded overflow-hidden mb-2 border border-gray-100">
                {p.images?.[0] ? (
                  <Image
                    src={p.images[0].imageUrl}
                    alt={p.name}
                    fill
                    className="object-contain p-2 group-hover:scale-105 transition-transform"
                    sizes="160px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300 text-xs">No Image</div>
                )}
              </div>
              <p className="text-[13px] leading-[18px] text-[#0f1111] line-clamp-2 group-hover:text-[#1d4ed8] transition-colors mb-1">
                {p.name}
              </p>
              {rating > 0 && (
                <div className="flex items-center gap-1 mb-0.5">
                  <div className="flex text-[#de7921]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} className="w-3 h-3" fill={s <= Math.round(rating) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-[#2563eb]">{p.reviewCount || 0}</span>
                </div>
              )}
              <span className="text-[#0F1111]">
                <sup className="text-[10px] font-medium" style={{ top: '-0.5em' }}>$</sup>
                <span className="text-[18px] font-light">{dollars}</span>
                <sup className="text-[10px] font-medium" style={{ top: '-0.5em' }}>{cents}</sup>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
