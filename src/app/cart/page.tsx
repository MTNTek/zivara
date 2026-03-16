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

export const metadata: Metadata = {
  title: 'Shopping Cart - Zivara',
  description: 'Review items in your shopping cart.',
};

export default async function CartPage() {
  const cartData = await getCartSummary();

  // Fetch supplier info for cart items
  const productIds = cartData.items.map((i) => i.product.id);
  const supplierMap = await getProductsSuppliers(productIds);

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
    <div className="min-h-screen bg-white">
      <div className="px-4 sm:px-6 lg:px-10 py-8">
        <Breadcrumbs items={[{ label: 'Cart' }]} />
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {cartData.items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                {hasSupplierGroups ? (
                  <div className="space-y-4">
                    {Array.from(grouped.entries()).map(([supplierId, group]) => (
                      <div key={supplierId} className="bg-white rounded-lg shadow-sm">
                        <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                          <span className="text-sm text-[#565959]">Fulfilled by </span>
                          <span className="text-sm font-medium text-[#007185]">{group.label}</span>
                        </div>
                        <CartItemsList items={group.items} />
                      </div>
                    ))}
                    {noSupplierItems.length > 0 && (
                      <div className="bg-white rounded-lg shadow-sm">
                        <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                          <span className="text-sm font-medium text-gray-700">Fulfilled by Zivara</span>
                        </div>
                        <CartItemsList items={noSupplierItems} />
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
                    <CartItemsList items={cartData.items} />
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
              className="w-24 h-24 text-gray-400 mx-auto mb-4"
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
              className="inline-block bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors"
            >
              Continue Shopping
            </Link>
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
