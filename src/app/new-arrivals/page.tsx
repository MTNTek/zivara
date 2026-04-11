import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/db';
import { products, productImages, inventory } from '@/db/schema';
import { eq, sql, desc } from 'drizzle-orm';
import { ProductCard } from '@/components/product/ProductCard';
import { getWishlistProductIds } from '@/features/wishlist/actions';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { BackToTop } from '@/components/ui/back-to-top';
import { NewsletterCTA } from '@/components/home/newsletter-cta';
import { SharePageButton } from '@/components/ui/share-page-button';
import { SortSelect } from '@/components/ui/sort-select';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'New Arrivals - Zivara',
  description: 'Discover the latest products added to Zivara. Shop new arrivals across all categories.',
  openGraph: {
    title: 'New Arrivals - Zivara',
    description: 'Discover the latest products added to Zivara. Shop new arrivals across all categories.',
    type: 'website',
  },
};

export const dynamic = 'force-dynamic';

interface NewArrivalsPageProps {
  searchParams: Promise<{ sort?: string }>;
}

export default async function NewArrivalsPage({ searchParams }: NewArrivalsPageProps) {
  const { sort = 'newest' } = await searchParams;

  const orderByClause = sort === 'price_asc'
    ? products.price
    : sort === 'price_desc'
    ? desc(products.price)
    : sort === 'rating'
    ? desc(products.averageRating)
    : sort === 'discount'
    ? desc(sql`COALESCE((${products.price} - ${products.discountPrice}) / NULLIF(${products.price}, 0), 0)`)
    : desc(products.createdAt);
  const newProducts = await db
    .select({
      id: products.id,
      name: products.name,
      price: products.price,
      discountPrice: products.discountPrice,
      averageRating: products.averageRating,
      reviewCount: products.reviewCount,
      createdAt: products.createdAt,
    })
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(orderByClause)
    .limit(40);

  const productIds = newProducts.map((p) => p.id);

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
            name: 'New Arrivals',
            description: 'Discover the latest products added to Zivara.',
            url: `${baseUrl}/new-arrivals`,
            numberOfItems: newProducts.length,
            provider: { '@type': 'Organization', name: 'Zivara' },
          }),
        }}
      />

      <div className="px-4 sm:px-6 lg:px-10 py-6">
        <Breadcrumbs items={[{ label: 'New Arrivals' }]} />

        <div className="bg-white rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0F1111]">New Arrivals</h1>
              <p className="text-sm text-[#565959] mt-1">
                The latest products added to our store
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Suspense fallback={null}>
                <SortSelect
                  options={[
                    { value: 'newest', label: 'Newest First' },
                    { value: 'price_asc', label: 'Price: Low to High' },
                    { value: 'price_desc', label: 'Price: High to Low' },
                    { value: 'rating', label: 'Top Rated' },
                    { value: 'discount', label: 'Biggest Discount' },
                  ]}
                />
              </Suspense>
              <SharePageButton />
            </div>
          </div>
        </div>

        {newProducts.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No new products yet</h2>
            <p className="text-gray-500 mb-4">Check back soon for new arrivals.</p>
            <Link href="/products" className="text-[#2563eb] hover:text-[#1d4ed8] hover:underline text-sm">
              Browse all products
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-5">
              {newProducts.map((p) => {
                const daysAgo = Math.floor((Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                const timeLabel = daysAgo === 0 ? 'Added today' : daysAgo === 1 ? 'Added yesterday' : daysAgo <= 7 ? `Added ${daysAgo} days ago` : `Added ${Math.floor(daysAgo / 7)}w ago`;
                return (
                <div key={p.id} className="relative">
                  <div className="absolute top-1 left-1 z-10 bg-[#2563eb] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    {timeLabel}
                  </div>
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
                    linkQuery="from=new-arrivals"
                  />
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Newsletter CTA */}
        <div className="mt-6 max-w-md mx-auto">
          <NewsletterCTA />
        </div>
      </div>

      <BackToTop />
    </div>
  );
}
