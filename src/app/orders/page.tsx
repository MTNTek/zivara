import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getUserOrders } from '@/features/orders/queries';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { getCurrentUserId } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { OrderFilters } from '@/components/orders/order-filters';
import { BackToTop } from '@/components/ui/back-to-top';

export const metadata: Metadata = {
  title: 'My Orders - Zivara',
  description: 'View and track your orders.',
};

interface OrdersPageProps {
  searchParams: Promise<{
    status?: string;
    days?: string;
    search?: string;
  }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const userId = await getCurrentUserId();
  if (!userId) redirect('/login?redirect=/orders');

  const sp = await searchParams;

  const startDate = sp.days ? new Date(Date.now() - Number(sp.days) * 86400000) : undefined;

  const { orders } = await getUserOrders(userId, {
    page: 1,
    limit: 50,
    status: sp.status || undefined,
    startDate,
  });

  // Client-side search filter (order number)
  const filtered = sp.search
    ? orders.filter(o => o.orderNumber.toLowerCase().includes(sp.search!.toLowerCase()))
    : orders;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-[#eff6ff] text-[#2563eb]';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="px-4 sm:px-6 lg:px-10 py-6">
        <Breadcrumbs items={[{ label: 'Your Orders' }]} />
        <h1 className="text-2xl font-bold text-[#0F1111] mb-4">Your Orders</h1>

        <Suspense fallback={null}>
          <OrderFilters />
        </Suspense>

        {filtered.length > 0 ? (
          <div className="space-y-4">
            <p className="text-xs text-[#565959]">
              {filtered.length} order{filtered.length !== 1 ? 's' : ''}
              {sp.status && ` · ${sp.status}`}
              {sp.search && ` · matching "${sp.search}"`}
            </p>
            {filtered.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Order header bar */}
                <div className="bg-[#F0F2F2] border-b border-[#D5D9D9] px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#565959]">
                  <div className="flex flex-wrap gap-4 sm:gap-6">
                    <div>
                      <p className="uppercase font-medium">Order placed</p>
                      <p className="text-[#0F1111]">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="uppercase font-medium">Total</p>
                      <p className="text-[#0F1111] font-medium">${Number(order.total).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="uppercase font-medium">Order #</p>
                      <p className="text-[#0F1111]">{order.orderNumber}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>

                {/* Order body */}
                <div className="px-4 sm:px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex -space-x-2 flex-shrink-0">
                        {(order.items || []).slice(0, 4).map((item, i) => (
                          <div
                            key={i}
                            className="w-12 h-12 rounded border-2 border-white bg-gray-100 overflow-hidden relative"
                            style={{ zIndex: 4 - i }}
                          >
                            {item.product?.images?.[0]?.imageUrl ? (
                              <Image
                                src={item.product.images[0].imageUrl}
                                alt={item.productName || 'Product'}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-gray-300">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                              </div>
                            )}
                          </div>
                        ))}
                        {(order.items?.length || 0) > 4 && (
                          <div className="w-12 h-12 rounded border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-[#565959] font-medium">
                            +{(order.items?.length || 0) - 4}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-[#0F1111] line-clamp-1">
                          {order.items?.[0]?.productName || 'Order items'}
                          {(order.items?.length || 0) > 1 && (
                            <span className="text-[#565959]"> and {(order.items?.length || 0) - 1} more</span>
                          )}
                        </p>
                        <p className="text-xs text-[#565959]">
                          {order.items?.length || 0} {(order.items?.length || 0) === 1 ? 'item' : 'items'}
                        </p>
                        {order.status === 'shipped' && (
                          <p className="text-xs text-[#007600] mt-0.5">
                            {order.estimatedDeliveryDate
                              ? <>Arriving {new Date(order.estimatedDeliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
                              : <>Estimated delivery {new Date(new Date(order.createdAt).getTime() + 7 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
                            }
                          </p>
                        )}
                        {order.status === 'processing' && (
                          <p className="text-xs text-[#B12704] mt-0.5">
                            Preparing to ship
                          </p>
                        )}
                        {order.status === 'delivered' && (
                          <p className="text-xs text-[#007600] mt-0.5">
                            Delivered {new Date(order.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                      {order.status === 'delivered' && (
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-sm text-[#2563eb] hover:text-[#1d4ed8] hover:underline hidden sm:inline"
                        >
                          Buy again
                        </Link>
                      )}
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-sm text-[#2563eb] hover:text-[#1d4ed8] hover:underline"
                      >
                        View order details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-xl font-bold text-[#0F1111] mb-2">
              {sp.status || sp.search ? 'No matching orders' : 'No orders yet'}
            </h2>
            <p className="text-sm text-[#565959] mb-6">
              {sp.status || sp.search
                ? 'Try adjusting your filters or search terms.'
                : "When you place orders, they'll appear here for easy tracking."}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {(sp.status || sp.search) ? (
                <Link
                  href="/orders"
                  className="bg-[#fbbf24] hover:bg-[#f59e0b] text-sm font-medium text-[#0F1111] px-6 py-2.5 rounded-full transition-colors"
                >
                  Clear Filters
                </Link>
              ) : (
                <>
                  <Link
                    href="/products"
                    className="bg-[#fbbf24] hover:bg-[#f59e0b] text-sm font-medium text-[#0F1111] px-6 py-2.5 rounded-full transition-colors"
                  >
                    Start Shopping
                  </Link>
                  <Link
                    href="/track"
                    className="border border-[#D5D9D9] bg-white hover:bg-[#F7FAFA] text-sm font-medium text-[#0F1111] px-6 py-2.5 rounded-full transition-colors"
                  >
                    Track a Guest Order
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <BackToTop />
    </div>
  );
}
