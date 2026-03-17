import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/db';
import { products, productImages, inventory, categories } from '@/db/schema';
import { eq, and, isNotNull, sql, desc } from 'drizzle-orm';
import { ProductCard } from '@/components/product/ProductCard';
import { getWishlistProductIds } from '@/features/wishlist/actions';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export const metadata: Metadata = {
  title: "Today's Deals - Zivara",
  description: 'Shop the best deals and discounts on Zivara. Save big on electronics, fashion, home goods and more.',
};

export const dynamic = 'force-dynamic';

export default async function DealsPage() {
  const dealProducts = await db
    .select({
      id: products.id,
      name: products.name,
      price: products.price,
      discountPrice: products.discountPrice,
      averageRating: products.averageRating,
      reviewCount: products.reviewCount,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(
      and(
        eq(products.isActive, true),
        isNotNull(products.discountPrice),
        sql`${products.discountPrice}::numeric < ${products.price}::numeric`
      )
    )
    .orderBy(desc(sql`(${products.price}::numeric - ${products.discountPrice}::numeric) / ${products.price}::numeric`))
    .limit(60);

  // Get images and inventory for these products
  const productIds = dealProducts.map((p) => p.id);

  const images = productIds.length > 0
    ? await db
        .select({ productId: productImages.productId, imageUrl: productImages.imageUrl })
        .from(productImages)
        .where(sql`${productImages.productId} IN ${productIds}`)
        .orderBy(productImages.displayOrder)
    : [];

  const stocks = productIds.length > 0
    ? await db
        .select({ productId: inventory.productId, quantity: inventory.quantity })
        .from(inventory)
        .where(sql`${inventory.productId} IN ${productIds}`)
    : [];

  const wishlistedIds = await getWishlistProductIds();

  const imageMap = new Map<string, string>();
  for (const img of images) {
    if (!imageMap.has(img.productId)) imageMap.set(img.productId, img.imageUrl);
  }
  const stockMap = new Map<string, number>();
  for (const s of stocks) {
    stockMap.set(s.productId, s.quantity);
  }

  // Group by category
  const categoryMap = new Map<string, typeof dealProducts>();
  for (const p of dealProducts) {
    const cat = p.categoryName || 'Other';
    if (!categoryMap.has(cat)) categoryMap.set(cat, []);
    categoryMap.get(cat)!.push(p);
  }

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="px-4 sm:px-6 lg:px-10 py-6">
        <Breadcrumbs items={[{ label: "Today's Deals" }]} />

        {/* Header */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-[#0F1111]">Today&apos;s Deals</h1>
          <p className="text-sm text-[#565959] mt-1">
            {dealProducts.length} deal{dealProducts.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {dealProducts.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No deals right now</h2>
            <p className="text-gray-500 mb-4">Check back soon for new deals and discounts.</p>
            <Link href="/products" className="text-[#007185] hover:text-[#c7511f] hover:underline text-sm">
              Browse all products
            </Link>
          </div>
        ) : (
          <>
            {/* All deals grid */}
            <div className="bg-white rounded-lg p-5 mb-6">
              <h2 className="text-lg font-bold text-[#0F1111] mb-4">All Deals</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-5">
                {dealProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    price={p.price}
                    discountPrice={p.discountPrice}
                    imageUrl={imageMap.get(p.id)}
                    averageRating={p.averageRating}
                    reviewCount={p.reviewCount || 0}
                    stock={stockMap.get(p.id) ?? 0}
                    isWishlisted={wishlistedIds.includes(p.id)}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
