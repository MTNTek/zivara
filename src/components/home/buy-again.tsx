import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getCurrentUserId } from '@/lib/auth';

async function getBuyAgainProducts() {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const recentOrders = await db.query.orders.findMany({
    where: eq(orders.userId, userId),
    orderBy: [desc(orders.createdAt)],
    limit: 5,
    with: {
      items: {
        with: {
          product: {
            columns: { id: true, name: true, price: true, discountPrice: true },
            with: { images: { limit: 1, columns: { imageUrl: true, thumbnailUrl: true } } },
          },
        },
      },
    },
  });

  // Deduplicate products across orders
  const seen = new Set<string>();
  const products: Array<{
    id: string;
    name: string;
    price: string;
    discountPrice: string | null;
    imageUrl: string | undefined;
  }> = [];

  for (const order of recentOrders) {
    for (const item of order.items) {
      if (!seen.has(item.product.id)) {
        seen.add(item.product.id);
        products.push({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          discountPrice: item.product.discountPrice,
          imageUrl: item.product.images?.[0]?.thumbnailUrl || item.product.images?.[0]?.imageUrl,
        });
      }
    }
    if (products.length >= 12) break;
  }

  return products.slice(0, 12);
}

export async function BuyAgain() {
  const products = await getBuyAgainProducts();
  if (products.length === 0) return null;

  return (
    <div className="bg-white p-5">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-[21px] font-bold text-[#0f1111]">Buy Again</h2>
        <Link href="/orders" className="text-[13px] text-[#2563eb] hover:text-[#1d4ed8] hover:underline">
          View order history
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="flex-shrink-0 w-[140px] group"
          >
            <div className="relative w-[140px] h-[140px] bg-gray-100 rounded-lg overflow-hidden mb-2">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  sizes="140px"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            <p className="text-xs text-[#0F1111] line-clamp-2 group-hover:text-[#2563eb]">{product.name}</p>
            <p className="text-sm font-bold text-[#0F1111] mt-1">
              ${parseFloat(product.discountPrice || product.price).toFixed(2)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
