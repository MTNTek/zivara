import { db } from '@/db';
import { products } from '@/db/schema';
import { eq, ne, and, sql } from 'drizzle-orm';
import Link from 'next/link';
import Image from 'next/image';

interface RelatedProductsProps {
  productId: string;
  categoryId: string;
}

export async function RelatedProducts({ productId, categoryId }: RelatedProductsProps) {
  const related = await db.query.products.findMany({
    where: and(
      eq(products.categoryId, categoryId),
      ne(products.id, productId),
      eq(products.isActive, true),
    ),
    with: {
      images: { limit: 1 },
      inventory: true,
    },
    orderBy: sql`RANDOM()`,
    limit: 6,
  });

  if (related.length === 0) return null;

  return (
    <section className="bg-white rounded-lg shadow-sm p-6 mt-6">
      <h2 className="text-[21px] font-bold text-[#0f1111] mb-4">You Might Also Like</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-5">
        {related.map((product) => {
          const displayPrice = product.discountPrice || product.price;
          const dollars = Math.floor(Number(displayPrice));
          const cents = Math.round((Number(displayPrice) - dollars) * 100).toString().padStart(2, '0');

          return (
            <Link key={product.id} href={`/products/${product.id}`} className="group">
              <div className="relative aspect-square bg-white overflow-hidden mb-1">
                {product.images?.[0] ? (
                  <Image
                    src={product.images[0].imageUrl}
                    alt={product.name}
                    fill
                    className="object-contain p-3"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300 text-xs">No Image</div>
                )}
              </div>
              <p className="text-[13px] leading-[18px] text-[#0f1111] line-clamp-2 group-hover:text-[#c7511f] transition-colors min-h-[36px]">
                {product.name}
              </p>
              <span className="text-[#0F1111]">
                <sup className="text-[11px] font-medium" style={{ top: '-0.5em' }}>$</sup>
                <span className="text-[21px] font-light">{dollars}</span>
                <sup className="text-[11px] font-medium" style={{ top: '-0.5em' }}>{cents}</sup>
              </span>
              {product.inventory && (
                <p className={`text-[12px] mt-0.5 ${product.inventory.quantity > 0 ? 'text-[#007600]' : 'text-red-600'}`}>
                  {product.inventory.quantity > 0 ? 'In Stock' : 'Currently unavailable'}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
