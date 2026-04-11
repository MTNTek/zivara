import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUserId } from '@/lib/auth';
import { getWishlistItems } from '@/features/wishlist/actions';
import { ProductCard } from '@/components/product/ProductCard';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { ShareWishlistButton } from '@/components/wishlist/share-wishlist-button';
import { MoveAllToCart } from '@/components/wishlist/move-all-to-cart';
import { BackToTop } from '@/components/ui/back-to-top';

export const metadata: Metadata = {
  title: 'My Wishlist - Zivara',
  description: 'Products you saved for later.',
};

export default async function WishlistPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect('/login?redirect=/wishlist');

  const items = await getWishlistItems();

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="px-4 sm:px-6 lg:px-10 py-8">
        <Breadcrumbs items={[{ label: 'Wishlist' }]} />

        <div className="bg-white rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0F1111]">
                My Wishlist {items.length > 0 && <span className="text-base font-normal text-[#565959]">({items.length} item{items.length !== 1 ? 's' : ''})</span>}
              </h1>
              {items.length > 0 && (
                <p className="text-sm text-[#565959] mt-1">
                  Total value: ${items.reduce((sum, item) => sum + Number(item.product.discountPrice || item.product.price), 0).toFixed(2)}
                </p>
              )}
            </div>
            {items.length > 0 && (
              <div className="flex items-center gap-3">
                <MoveAllToCart productIds={items.map((item) => item.product.id)} />
                <ShareWishlistButton />
              </div>
            )}
          </div>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-6">
            {items.map((item) => (
              <ProductCard
                key={item.id}
                id={item.product.id}
                name={item.product.name}
                price={item.product.price}
                discountPrice={item.product.discountPrice}
                imageUrl={item.product.images?.[0]?.imageUrl}
                averageRating={item.product.averageRating}
                reviewCount={item.product.reviewCount || 0}
                stock={item.product.inventory?.quantity ?? 0}
                isWishlisted={true}
                linkQuery="from=wishlist"
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Save products you love by clicking the heart icon</p>
            <Link href="/products" className="inline-block bg-[#fbbf24] text-[#0F1111] px-6 py-3 rounded-full font-semibold hover:bg-[#f59e0b] transition-colors border border-[#FCD200]">
              Browse Products
            </Link>

            <div className="mt-10 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">Explore popular categories</p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { label: 'Electronics', href: '/products/category/electronics' },
                  { label: "Men's Fashion", href: '/products/category/mens-fashion' },
                  { label: "Women's Fashion", href: '/products/category/womens-fashion' },
                  { label: 'Home & Kitchen', href: '/products/category/home-kitchen' },
                  { label: 'Best Sellers', href: '/bestsellers' },
                  { label: 'New Arrivals', href: '/new-arrivals' },
                ].map((cat) => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <BackToTop />
    </div>
  );
}
