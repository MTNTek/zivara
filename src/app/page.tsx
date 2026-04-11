import Link from 'next/link';
import { getProducts, getCategories } from '@/features/products/cached-queries';
import { ProductCard } from '@/components/product/ProductCard';
import { getWishlistProductIds } from '@/features/wishlist/actions';
import { RecentlyViewed } from '@/components/product/recently-viewed';
import { HeroCarousel } from '@/components/home/hero-carousel';
import { CategoryCardsGrid } from '@/components/home/category-cards';
import { ProductRow } from '@/components/home/product-row';
import { SignInCard } from '@/components/home/sign-in-card';
import { CategoryStrip } from '@/components/home/category-strip';
import { PromoBanner } from '@/components/home/promo-banner';
import { BuyAgain } from '@/components/home/buy-again';
import { TrendingTicker } from '@/components/home/trending-ticker';
import { Suspense } from 'react';
import { SocialProofBanner } from '@/components/home/social-proof-banner';
import { ShopByLifestyle } from '@/components/home/shop-by-lifestyle';
import { FeaturedCollections } from '@/components/home/featured-collections';
import { NewsletterInline } from '@/components/home/newsletter-inline';

export default async function HomePage() {
  const [
    { products: featuredProducts },
    { products: allProducts },
    categories,
    wishlistedIds,
  ] = await Promise.all([
    getProducts({ limit: 20, sortBy: 'newest' }),
    getProducts({ limit: 60 }),
    getCategories(),
    getWishlistProductIds(),
  ]);

  const dealProducts = allProducts
    .filter((p) => p.discountPrice && Number(p.discountPrice) < Number(p.price))
    .slice(0, 12);

  const topRated = [...allProducts]
    .sort((a, b) => Number(b.averageRating || 0) - Number(a.averageRating || 0))
    .slice(0, 12);

  const budgetPicks = allProducts
    .filter((p) => Number(p.discountPrice || p.price) < 50)
    .slice(0, 12);

  const toRowItem = (p: typeof allProducts[number]) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    discountPrice: p.discountPrice,
    imageUrl: p.images?.[0]?.imageUrl,
    averageRating: p.averageRating,
    reviewCount: p.reviewCount || 0,
  });

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      {/* Organization JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Zivara',
            url: process.env.NEXT_PUBLIC_APP_URL || 'https://zivara.com',
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL || 'https://zivara.com'}/products?search={search_term_string}`,
              },
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />

      <HeroCarousel />

      {/* Category Strip — overlaps hero */}
      <div className="relative z-10 -mt-10 sm:-mt-16">
        <CategoryStrip />
      </div>

      {/* Trending ticker */}
      <TrendingTicker />

      {/* Social proof banner */}
      <SocialProofBanner />

      {/* Category Cards — 4-col grid */}
      <div className="px-4 sm:px-6 lg:px-10 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[14px]">
          <CategoryCardsGrid categories={categories} />
        </div>
      </div>

      {/* Main content */}
      <div className="px-4 sm:px-6 lg:px-10 mt-[14px] space-y-[14px] pb-8">
        <div className="lg:hidden">
          <SignInCard />
        </div>

        {/* Buy Again — personalized for logged-in users */}
        <Suspense fallback={null}>
          <BuyAgain />
        </Suspense>

        {/* Promo Banner 1 */}
        <PromoBanner
          href="/products/category/electronics"
          imageUrl="https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1600&h=400&fit=crop"
          alt="Electronics Sale"
          title="Top Electronics Deals"
          subtitle="Up to 40% off on smartphones, laptops & more"
          cta="Shop Now"
        />

        {/* Today's Deals */}
        {dealProducts.length > 0 && (
          <ProductRow title="Today&apos;s Deals" products={dealProducts.map(toRowItem)} seeMoreHref="/deals" />
        )}

        {/* Shop by Lifestyle */}
        <ShopByLifestyle />

        {/* Featured Collections */}
        <FeaturedCollections />

        <ProductRow title="Top Rated Products" products={topRated.map(toRowItem)} seeMoreHref="/bestsellers" />

        {/* Promo Banner 2 */}
        <PromoBanner
          href="/products/category/home-kitchen"
          imageUrl="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&h=400&fit=crop"
          alt="Home & Kitchen"
          title="Refresh Your Home"
          subtitle="New arrivals in furniture, kitchen & decor"
          cta="Shop Home"
        />

        {budgetPicks.length > 0 && (
          <ProductRow title="Under $50" products={budgetPicks.map(toRowItem)} seeMoreHref="/products?sortBy=price_asc" />
        )}

        {/* Newsletter CTA */}
        <NewsletterInline />

        {/* New Arrivals — featuredProducts are already sorted by newest */}
        {featuredProducts.length > 0 && (
          <ProductRow title="New Arrivals" products={featuredProducts.slice(0, 12).map(toRowItem)} seeMoreHref="/new-arrivals" />
        )}

        {/* Featured Products Grid */}
        <div className="bg-white p-5">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-[21px] font-bold text-[#0f1111]">Featured Products</h2>
            <Link href="/products" className="text-[13px] text-[#2563eb] hover:text-[#1d4ed8] hover:underline">
              Shop all products
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-5">
            {featuredProducts.slice(0, 10).map((product, idx) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                discountPrice={product.discountPrice}
                imageUrl={product.images?.[0]?.imageUrl}
                averageRating={product.averageRating}
                reviewCount={product.reviewCount || 0}
                stock={product.inventory?.quantity ?? 0}
                isWishlisted={wishlistedIds.includes(product.id)}
                badge={
                  idx < 3 ? 'new' :
                  topRated.some(t => t.id === product.id) ? 'bestseller' :
                  dealProducts.some(d => d.id === product.id) ? 'deal' :
                  null
                }
              />
            ))}
          </div>
        </div>

        {/* More category cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[14px]">
          <CategoryCardsGrid
            categories={categories.filter(
              (c) => !['electronics', 'mens-fashion', 'womens-fashion', 'home-kitchen', 'beauty-health'].includes(c.slug)
            )}
          />
        </div>

        <div className="bg-white p-5">
          <RecentlyViewed />
        </div>
      </div>
    </div>
  );
}
