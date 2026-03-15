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
      <HeroCarousel />

      <div className="relative z-10 -mt-10 sm:-mt-16">
        <CategoryStrip categories={categories} />
      </div>

      {/* Category Cards — Amazon 4-col grid */}
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

        {dealProducts.length > 0 && (
          <ProductRow title="Today&apos;s Deals" products={dealProducts.map(toRowItem)} seeMoreHref="/products?sortBy=price_asc" />
        )}

        <ProductRow title="Top Rated Products" products={topRated.map(toRowItem)} seeMoreHref="/products?sortBy=rating" />

        {budgetPicks.length > 0 && (
          <ProductRow title="Under $50" products={budgetPicks.map(toRowItem)} seeMoreHref="/products?sortBy=price_asc" />
        )}

        {/* Featured Products Grid */}
        <div className="bg-white p-5">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-[21px] font-bold text-[#0f1111]">Featured Products</h2>
            <Link href="/products" className="text-[13px] text-[#007185] hover:text-[#c7511f] hover:underline">
              Shop all products
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-5">
            {featuredProducts.slice(0, 10).map((product) => (
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
              />
            ))}
          </div>
        </div>

        {/* Promo banners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px]">
          <Link href="/products" className="bg-white p-5 hover:shadow-sm transition-shadow">
            <h3 className="text-[16px] font-bold text-[#0f1111] mb-1">Free Shipping</h3>
            <p className="text-[13px] text-[#565959] mb-2">On orders over $50</p>
            <span className="text-[13px] text-[#007185] hover:text-[#c7511f]">Shop now</span>
          </Link>
          <Link href="/products?sortBy=newest" className="bg-white p-5 hover:shadow-sm transition-shadow">
            <h3 className="text-[16px] font-bold text-[#0f1111] mb-1">New Arrivals</h3>
            <p className="text-[13px] text-[#565959] mb-2">Check out the latest products</p>
            <span className="text-[13px] text-[#007185] hover:text-[#c7511f]">Explore</span>
          </Link>
          <Link href="/products?sortBy=rating" className="bg-white p-5 hover:shadow-sm transition-shadow">
            <h3 className="text-[16px] font-bold text-[#0f1111] mb-1">Best Sellers</h3>
            <p className="text-[13px] text-[#565959] mb-2">Most popular items this week</p>
            <span className="text-[13px] text-[#007185] hover:text-[#c7511f]">View all</span>
          </Link>
        </div>

        {/* More categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[14px]">
          <CategoryCardsGrid
            categories={categories.filter(
              (c) => !['electronics', 'fashion', 'home-kitchen', 'beauty-health'].includes(c.slug)
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
