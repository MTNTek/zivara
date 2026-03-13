import { db } from '@/db';
import { products, productImages, inventory } from '@/db/schema';
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
      <h2 className="text-xl font-bold text-gray-900 mb-4">You Might Also Like</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {related.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group"
          >
            <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden mb-2">
              {product.images?.[0] ? (
                <Image
                  src={product.images[0].imageUrl}
                  alt={product.name}
                  fill
                  className="object-contain p-2 group-hover:scale-105 transition-transform"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Image</div>
              )}
            </div>
            <p className="text-sm text-gray-900 line-clamp-2 group-hover:text-teal-600 transition-colors min-h-[40px]">
              {product.name}
            </p>
            <div className="mt-1">
              {product.discountPrice ? (
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-red-600">${Number(product.discountPrice).toFixed(2)}</span>
                  <span className="text-xs text-gray-500 line-through">${Number(product.price).toFixed(2)}</span>
                </div>
              ) : (
                <span className="text-sm font-bold text-gray-900">${Number(product.price).toFixed(2)}</span>
              )}
            </div>
            {product.inventory && (
              <p className={`text-xs mt-1 ${product.inventory.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.inventory.quantity > 0 ? 'In Stock' : 'Out of Stock'}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
