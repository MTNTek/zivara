import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getOrderById } from '@/features/orders/queries';
import { getCurrentUserId } from '@/lib/auth';
import { OrderTimeline } from '@/components/orders/order-timeline';
import { getOrderSubOrders } from '@/features/suppliers/queries';
import { CopyOrderNumber } from '@/components/orders/copy-order-number';
import { PrintOrderButton } from '@/components/orders/print-order-button';
import { CancelOrderButton } from '@/components/orders/cancel-order-button';
import { ReorderButton } from '@/components/orders/reorder-button';
import { CopyTrackingNumber } from '@/components/orders/copy-tracking-number';

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const userId = await getCurrentUserId();

  const order = await getOrderById(id);
  if (!order) notFound();

  // Allow access if: logged-in user owns the order, OR it's a guest order
  const isOwner = userId && order.userId === userId;
  const isGuestOrder = !order.userId && order.guestEmail;
  if (!isOwner && !isGuestOrder) {
    if (!userId) redirect('/login?redirect=/orders/' + id);
    notFound();
  }

  // Fetch sub-orders for supplier tracking
  const subOrdersList = await getOrderSubOrders(id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-[#eff6ff] text-[#2563eb]';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="px-4 sm:px-6 lg:px-10 py-8">
        {/* Order Status Timeline */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Progress</h2>
          <OrderTimeline status={order.status} orderDate={order.createdAt.toISOString()} />
        </div>

        {/* Header */}
        <div className="mb-8">
          <Link href="/orders" className="text-black hover:text-gray-700 mb-4 inline-block">
            ← Back to Orders
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Order #{order.orderNumber}
                <CopyOrderNumber orderNumber={order.orderNumber} />
              </h1>
              <p className="text-gray-600 mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <PrintOrderButton />
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                    <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product?.images?.[0] ? (
                        <Image
                          src={item.product.images[0].thumbnailUrl || item.product.images[0].imageUrl}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-600">
                        ${Number(item.priceAtPurchase).toFixed(2)} each
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${Number(item.subtotal).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
              <address className="text-gray-700 not-italic">
                {order.shippingAddressLine1}<br />
                {order.shippingAddressLine2 && <>{order.shippingAddressLine2}<br /></>}
                {order.shippingCity}, {order.shippingState} {order.shippingPostalCode}<br />
                {order.shippingCountry}
              </address>
            </div>

            {/* Review prompt for delivered orders */}
            {order.status === 'delivered' && order.items && order.items.length > 0 && (
              <div className="bg-[#FFF8E1] border border-[#FFE082] rounded-lg p-5">
                <h2 className="text-sm font-semibold text-[#0F1111] mb-2">How was your order?</h2>
                <p className="text-xs text-[#565959] mb-3">Help other shoppers by reviewing the products you purchased.</p>
                <div className="space-y-2">
                  {order.items.slice(0, 3).map((item) => (
                    <a
                      key={item.id}
                      href={`/products/${item.productId}/reviews`}
                      className="flex items-center gap-2 text-sm text-[#2563eb] hover:text-[#1d4ed8] hover:underline"
                    >
                      <span className="text-[#de7921]">★</span>
                      Review &quot;{item.productName}&quot;
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-order tracking */}
            {subOrdersList.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipment Details</h2>
                <div className="space-y-4">
                  {subOrdersList.map((sub, idx) => (
                    <div key={sub.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            Shipment {idx + 1}
                          </span>
                          <span className="text-xs text-[#565959] ml-2">
                            Fulfilled by <span className="text-[#2563eb]">{sub.supplier?.displayLabel || sub.supplier?.name || 'Unknown'}</span>
                          </span>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(sub.status)}`}>
                          {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                        </span>
                      </div>
                      {sub.trackingNumber && (
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Tracking:</span> {sub.trackingNumber}
                          <CopyTrackingNumber trackingNumber={sub.trackingNumber} />
                          {sub.carrierName && <span className="ml-2">({sub.carrierName})</span>}
                        </div>
                      )}
                      {sub.estimatedDelivery && (
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Est. delivery:</span>{' '}
                          {new Date(sub.estimatedDelivery).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                      )}
                      {sub.items && sub.items.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Items in this shipment:</p>
                          <ul className="text-sm text-gray-700 space-y-0.5">
                            {sub.items.map((item) => (
                              <li key={item.id}>
                                {item.orderItem?.productName || 'Product'} × {item.quantity}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${Number(order.subtotal).toFixed(2)}</span>
                </div>
                {order.discount && Number(order.discount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#007600]">Coupon discount</span>
                    <span className="text-[#007600] font-medium">-${Number(order.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>${Number(order.tax).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  {Number(order.shipping) === 0 ? (
                    <span className="text-[#007600] font-medium">FREE</span>
                  ) : (
                    <span>${Number(order.shipping).toFixed(2)}</span>
                  )}
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total</span>
                    <span>${Number(order.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Tracking Info */}
              {order.trackingNumber && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Tracking Information</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    Carrier: {order.carrierName || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Tracking #: {order.trackingNumber}
                    <CopyTrackingNumber trackingNumber={order.trackingNumber} />
                  </p>
                </div>
              )}

              {/* Reorder */}
              <ReorderButton
                items={(order.items || []).map(item => ({
                  productId: item.productId,
                  productName: item.productName,
                  quantity: item.quantity,
                }))}
                orderStatus={order.status}
              />

              {/* Cancel Order */}
              <CancelOrderButton orderId={order.id} orderStatus={order.status} />

              {/* Need Help */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <Link
                  href="/contact"
                  className="flex items-center gap-2 text-sm text-[#2563eb] hover:text-[#1d4ed8] hover:underline"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Need help with this order?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
