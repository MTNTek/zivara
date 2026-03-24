import type { Metadata } from 'next';
import Link from 'next/link';
import { getCartSummary } from '@/features/cart/queries';
import { CartItemsList } from '@/components/cart/cart-items-list';
import { CartSummary } from '@/components/cart/cart-summary';
import { CartRecommendations } from '@/components/cart/cart-recommendations';
import { RecentlyViewed } from '@/components/product/recently-viewed';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Suspense } from 'react';
import { getProductsSuppliers } from '@/features/suppliers/queries';
import { getWishlistProductIds } from '@/features/wishlist/actions';
import { ClearCartButton } from '@/components/cart/clear-cart-button';

export const metadata: Metadata = {
  title: 'Shopping Cart - Zivara',
  description: 'Review items in your shopping cart.',
};

export default async function CartPage() {
  const cartData = await getCartSummary();

  // Fetch supplier info and wishlist in parallel
  const productIds = cartData.items.map((i) => i.product.id);
  const [supplierMap, wishlistedIds] = await Promise.all([
    getProductsSuppliers(productIds),
    getWishlistProductIds(),
  ]);

  // Group items by supplier
  type CartItem = typeof cartData.items[number];
  const grouped = new Map<string, { label: string; items: CartItem[] }>();
  const noSupplierItems: CartItem[] = [];

  for (const item of cartData.items) {
    const info = supplierMap.get(item.product.id);
    if (info) {
      const key = info.supplierId;
      if (!grouped.has(key)) {
        grouped.set(key, { label: info.displayLabel, items: [] });
      }
      grouped.get(key)!.items.push(item);
    } else {
      noSupplierItems.push(item);
    }
  }

  const hasSupplierGroups = grouped.size > 0;

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="px-4 sm:px-6 lg:px-10 py-8">
        <Breadcrumbs items={[{ label: 'Cart' }]} />
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          {cartData.items.length > 0 && <ClearCartButton />}
        </div>

        {cartData.items.length > 0 ? (
          <>
            {/* Savings banner */}
            {(() => {
              const totalSavings = cartData.items.reduce((sum, item) => {
                const listPrice = Number(item.product.price);
                const paidPrice = Number(item.priceAtAdd);
                if (paidPrice < listPrice) {
                  return sum + (listPrice - paidPrice) * item.quantity;
                }
                return sum;
              }, 0);
              if (totalSavings <= 0) return null;
              return (
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span className="text-sm text-green-800">
                    You&apos;re saving <span className="font-semibold">${totalSavings.toFixed(2)}</span> on this order with current deals
                  </span>
                </div>
              );
            })()}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                {hasSupplierGroups ? (
                  <div className="space-y-4">
                    {Array.from(grouped.entries()).map(([supplierId, group]) => (
                      <div key={supplierId} className="bg-white rounded-lg shadow-sm">
                        <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                          <span className="text-sm text-[#565959]">Fulfilled by </span>
                          <span className="text-sm font-medium text-[#2563eb]">{group.label}</span>
                        </div>
                        <CartItemsList items={group.items} wishlistedIds={wishlistedIds} />
                      </div>
                    ))}
                    {noSupplierItems.length > 0 && (
                      <div className="bg-white rounded-lg shadow-sm">
                        <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                          <span className="text-sm font-medium text-gray-700">Fulfilled by Zivara</span>
                        </div>
                        <CartItemsList items={noSupplierItems} wishlistedIds={wishlistedIds} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Cart Items ({cartData.totalQuantity})
                      </h2>
                    </div>
                    <CartItemsList items={cartData.items} wishlistedIds={wishlistedIds} />
                  </div>
                )}
              </div>

              {/* Cart Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
                  <CartSummary
                    subtotal={cartData.subtotal}
                    itemCount={cartData.itemCount}
                    totalQuantity={cartData.totalQuantity}
                  />
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <Suspense fallback={null}>
              <CartRecommendations excludeIds={cartData.items.map((i) => i.product.id)} />
            </Suspense>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg
              className="w-24 h-24 text-gray-400 mx-auto mb-4 animate-gentle-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Add some products to get started
            </p>
            <Link
              href="/products"
              className="inline-block bg-[#fbbf24] text-[#0F1111] px-6 py-3 rounded-full font-semibold hover:bg-[#f59e0b] transition-colors border border-[#FCD200]"
            >
              Continue Shopping
            </Link>

            {/* Popular categories */}
            <div className="mt-10 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">Popular categories</p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { label: 'Electronics', href: '/products/category/electronics' },
                  { label: "Men's Fashion", href: '/products/category/mens-fashion' },
                  { label: "Women's Fashion", href: '/products/category/womens-fashion' },
                  { label: 'Home & Kitchen', href: '/products/category/home-kitchen' },
                  { label: 'Deals', href: '/deals' },
                  { label: 'Best Sellers', href: '/bestsellers' },
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

        {/* Recently Viewed (shown when cart is empty too) */}
        {cartData.items.length === 0 && (
          <div className="mt-8">
            <RecentlyViewed />
          </div>
        )}
      </div>
    </div>
  );
}
