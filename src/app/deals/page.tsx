import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/db';
import { products, productImages, inventory, categories } from '@/db/schema';
import { eq, and, isNotNull, sql, desc } from 'drizzle-orm';
import { ProductCard } from '@/components/product/ProductCard';
import { getWishlistProductIds } from '@/features/wishlist/actions';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { BackToTop } from '@/components/ui/back-to-top';
import { DealsCountdown } from '@/components/deals/deals-countdown';
import { NewsletterCTA } from '@/components/home/newsletter-cta';
import { SharePageButton } from '@/components/ui/share-page-button';
import { SortSelect } from '@/components/ui/sort-select';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: "Today's Deals - Zivara",
  description: 'Shop the best deals and discounts on Zivara. Save big on electronics, fashion, home goods and more.',
  openGraph: {
    title: "Today's Deals - Zivara",
    description: 'Shop the best deals and discounts on Zivara. Save big on electronics, fashion, home goods and more.',
    type: 'website',
  },
};

export const dynamic = 'force-dynamic';

interface DealsPageProps {
  searchParams: Promise<{ sort?: string }>;
}

export default async function DealsPage({ searchParams }: DealsPageProps) {
  const { sort = 'discount' } = await searchParams;

  const orderByClause = sort === 'price_asc'
    ? products.discountPrice
    : sort === 'price_desc'
    ? desc(products.discountPrice!)
    : sort === 'rating'
    ? desc(products.averageRating)
    : sort === 'newest'
    ? desc(products.createdAt)
    : desc(sql`(${products.price} - ${products.discountPrice}) / ${products.price}`);

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
        sql`${products.discountPrice} < ${products.price}`
      )
    )
    .orderBy(orderByClause)
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
            name: "Today's Deals",
            description: 'Shop the best deals and discounts on Zivara.',
            url: `${baseUrl}/deals`,
            numberOfItems: dealProducts.length,
            provider: { '@type': 'Organization', name: 'Zivara' },
          }),
        }}
      />

      <div className="px-4 sm:px-6 lg:px-10 py-6">
        <Breadcrumbs items={[{ label: "Today's Deals" }]} />

        {/* Header */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-[#0F1111]">Today&apos;s Deals</h1>
                <span className="inline-flex items-center gap-1 bg-[#FEF3CD] text-[#856404] text-xs font-semibold px-2.5 py-1 rounded-full">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Limited time
                </span>
              </div>
              <p className="text-sm text-[#565959]">
                {dealProducts.length} deal{dealProducts.length !== 1 ? 's' : ''} available — prices and availability subject to change
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Suspense fallback={null}>
                <SortSelect
                  options={[
                    { value: 'discount', label: 'Biggest Discount' },
                    { value: 'price_asc', label: 'Price: Low to High' },
                    { value: 'price_desc', label: 'Price: High to Low' },
                    { value: 'rating', label: 'Top Rated' },
                    { value: 'newest', label: 'Newest First' },
                  ]}
                />
              </Suspense>
              <SharePageButton />
              <DealsCountdown />
            </div>
          </div>
          {dealProducts.length > 0 && (
            <div className="mt-4 pt-3 border-t border-[#e7e7e7] flex items-center gap-2">
              <svg className="w-4 h-4 text-[#CC0C39]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="text-sm text-[#0F1111]">
                Save up to <span className="font-bold text-[#CC0C39]">{Math.max(...dealProducts.map(p => Math.round(((Number(p.price) - Number(p.discountPrice)) / Number(p.price)) * 100)))}%</span> on select items
              </span>
            </div>
          )}
        </div>

        {dealProducts.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No deals right now</h2>
            <p className="text-gray-500 mb-4">Check back soon for new deals and discounts.</p>
            <Link href="/products" className="text-[#2563eb] hover:text-[#1d4ed8] hover:underline text-sm">
              Browse all products
            </Link>
          </div>
        ) : (
          <>
            {/* All deals grid */}
            {/* Category filter tabs */}
            <div className="bg-white rounded-lg p-4 mb-4 flex gap-2 overflow-x-auto scrollbar-hide">
              {Array.from(categoryMap.keys()).map((cat) => (
                <a
                  key={cat}
                  href={`#deal-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  className="flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-medium border border-[#D5D9D9] bg-white hover:bg-[#F7FAFA] text-[#0F1111] transition-colors"
                >
                  {cat} ({categoryMap.get(cat)!.length})
                </a>
              ))}
            </div>

            {/* Deals by category */}
            {Array.from(categoryMap.entries()).map(([cat, catProducts]) => (
              <div key={cat} id={`deal-${cat.toLowerCase().replace(/\s+/g, '-')}`} className="bg-white rounded-lg p-5 mb-4">
                <h2 className="text-lg font-bold text-[#0F1111] mb-4">{cat}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-5">
                  {catProducts.map((p) => {
                    const pct = Math.round(((Number(p.price) - Number(p.discountPrice)) / Number(p.price)) * 100);
                    return (
                      <div key={p.id} className="relative">
                        <div className="absolute top-1 left-1 z-10 bg-[#CC0C39] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          {pct}% off
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
                          linkQuery="from=deals"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
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
