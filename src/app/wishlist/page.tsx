import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUserId } from '@/lib/auth';
import { getWishlistItems } from '@/features/wishlist/actions';
import { ProductCard } from '@/components/product/ProductCard';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export const metadata: Metadata = {
  title: 'My Wishlist - Zivara',
  description: 'Products you saved for later.',
};

export default async function WishlistPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect('/login?redirect=/wishlist');

  const items = await getWishlistItems();

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: 'Wishlist' }]} />
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          My Wishlist {items.length > 0 && <span className="text-lg font-normal text-gray-500">({items.length})</span>}
        </h1>

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
            <Link href="/products" className="inline-block bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors">
              Browse Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
