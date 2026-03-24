import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/db';
import { products, productImages, inventory, orderItems, orders } from '@/db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { ProductCard } from '@/components/product/ProductCard';
import { getWishlistProductIds } from '@/features/wishlist/actions';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { BackToTop } from '@/components/ui/back-to-top';
import { SharePageButton } from '@/components/ui/share-page-button';
import { NewsletterCTA } from '@/components/home/newsletter-cta';

export const metadata: Metadata = {
  title: 'Best Sellers - Zivara',
  description: 'Shop our most popular products. See what other customers are buying on Zivara.',
  openGraph: {
    title: 'Best Sellers - Zivara',
    description: 'Shop our most popular products. See what other customers are buying on Zivara.',
    type: 'website',
  },
};

export const dynamic = 'force-dynamic';

export default async function BestSellersPage() {
  // Try to get top selling products by order quantity
  const topSelling = await db
    .select({
      productId: orderItems.productId,
      totalSold: sql<number>`SUM(${orderItems.quantity})::int`,
    })
    .from(orderItems)
    .innerJoin(orders, and(eq(orderItems.orderId, orders.id), sql`${orders.status} != 'cancelled'`))
    .groupBy(orderItems.productId)
    .orderBy(desc(sql`SUM(${orderItems.quantity})`))
    .limit(40);

  const topSellingIds = topSelling.map((t) => t.productId);

  // If not enough order data, fall back to highest-rated products
  let productList;
  if (topSellingIds.length < 10) {
    productList = await db
      .select({
        id: products.id,
        name: products.name,
        price: products.price,
        discountPrice: products.discountPrice,
        averageRating: products.averageRating,
        reviewCount: products.reviewCount,
      })
      .from(products)
      .where(eq(products.isActive, true))
      .orderBy(desc(products.reviewCount), desc(products.averageRating))
      .limit(40);
  } else {
    productList = await db
      .select({
        id: products.id,
        name: products.name,
        price: products.price,
        discountPrice: products.discountPrice,
        averageRating: products.averageRating,
        reviewCount: products.reviewCount,
      })
      .from(products)
      .where(and(eq(products.isActive, true), sql`${products.id} IN ${topSellingIds}`))
      .limit(40);

    // Sort by sales rank
    const rankMap = new Map(topSellingIds.map((id, i) => [id, i]));
    productList.sort((a, b) => (rankMap.get(a.id) ?? 99) - (rankMap.get(b.id) ?? 99));
  }

  const productIds = productList.map((p) => p.id);

  const [images, stocks, wishlistedIds] = await Promise.all([
    productIds.length > 0
      ? db.select({ productId: productImages.productId, imageUrl: productImages.imageUrl })
          .from(productImages)
          .where(sql`${productImages.productId} IN ${productIds}`)
          .orderBy(productImages.displayOrder)
      : [],
    productIds.length > 0
      ? db.select({ productId: inventory.productId, quantity: inventory.quantity })
          .from(inventory)
          .where(sql`${inventory.productId} IN ${productIds}`)
      : [],
    getWishlistProductIds(),
  ]);

  const imageMap = new Map<string, string>();
  for (const img of images) {
    if (!imageMap.has(img.productId)) imageMap.set(img.productId, img.imageUrl);
  }
  const stockMap = new Map<string, number>();
  for (const s of stocks) {
    stockMap.set(s.productId, s.quantity);
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://zivara.com';

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      {/* CollectionPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Best Sellers',
            description: 'Shop our most popular products on Zivara.',
            url: `${baseUrl}/bestsellers`,
            numberOfItems: productList.length,
            provider: { '@type': 'Organization', name: 'Zivara' },
          }),
        }}
      />

      <div className="px-4 sm:px-6 lg:px-10 py-6">
        <Breadcrumbs items={[{ label: 'Best Sellers' }]} />

        <div className="bg-white rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0F1111]">Best Sellers</h1>
              <p className="text-sm text-[#565959] mt-1">
                Our most popular products based on sales
              </p>
            </div>
            <SharePageButton />
          </div>
        </div>

        {productList.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No products yet</h2>
            <p className="text-gray-500 mb-4">Check back soon for our best sellers.</p>
            <Link href="/products" className="text-[#2563eb] hover:text-[#1d4ed8] hover:underline text-sm">
              Browse all products
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-5">
              {productList.map((p, index) => (
                <div key={p.id} className="relative">
                  {index < 10 && (
                    <div className={`absolute top-1 left-1 z-10 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                      index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                      index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700' :
                      'bg-blue-800'
                    }`}>
                      #{index + 1}{index === 0 ? ' 🏆' : index === 1 ? ' 🥈' : index === 2 ? ' 🥉' : ''}
                    </div>
                  )}
                  <ProductCard
                    id={p.id}
                    name={p.name}
                    price={p.price}
                    discountPrice={p.discountPrice}
                    imageUrl={imageMap.get(p.id)}
                    averageRating={p.averageRating}
                    reviewCount={p.reviewCount || 0}
                    stock={stockMap.get(p.id) ?? 0}
                    isWishlisted={wishlistedIds.includes(p.id)}
                    linkQuery="from=bestsellers"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Newsletter CTA */}
      <div className="px-4 sm:px-6 lg:px-10 pb-6">
        <div className="max-w-md mx-auto">
          <NewsletterCTA />
        </div>
      </div>

      <BackToTop />
    </div>
  );
}
