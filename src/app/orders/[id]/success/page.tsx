import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getOrderById } from '@/features/orders/queries';
import { getCurrentUserId } from '@/lib/auth';
import { DeliveryEstimate } from '@/components/product/delivery-estimate';
import { CopyOrderNumber } from '@/components/orders/copy-order-number';
import { Confetti } from '@/components/ui/confetti';

export const metadata: Metadata = {
  title: 'Order Confirmed - Zivara',
  description: 'Your order has been placed successfully.',
};

interface SuccessPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderSuccessPage({ params }: SuccessPageProps) {
  const { id } = await params;
  const userId = await getCurrentUserId();

  const order = await getOrderById(id);
  if (!order) notFound();

  // Allow access if: logged-in user owns the order, OR it's a guest order (no userId on order)
  const isOwner = userId && order.userId === userId;
  const isGuestOrder = !order.userId && order.guestEmail;
  if (!isOwner && !isGuestOrder) {
    if (!userId) redirect('/login');
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <Confetti />
      <div className="px-4 sm:px-6 lg:px-10 py-12 max-w-2xl mx-auto animate-fade-in-up">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-bounce-in">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed</h1>
          <p className="text-gray-600">
            Thank you for your purchase. We&apos;ll send a confirmation email shortly.
          </p>
        </div>

        {/* Estimated Delivery */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-[#eff6ff] rounded-lg">
              <svg className="w-6 h-6 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Estimated Delivery</p>
            </div>
          </div>
          <DeliveryEstimate isInStock={true} />
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500">Order Number</p>
              <CopyOrderNumber orderNumber={order.orderNumber} />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-lg font-semibold text-gray-900">${Number(order.total).toFixed(2)}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Items</span>
              <span className="text-gray-900">{order.items?.length || 0}</span>
            </div>
            {order.discount && Number(order.discount) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#007600]">Coupon savings</span>
                <span className="text-[#007600] font-medium">-${Number(order.discount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping to</span>
              <span className="text-gray-900">{order.shippingCity}, {order.shippingState}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Status</span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium">
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Order Items Preview */}
        {order.items && order.items.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Items in this order</h2>
            <div className="space-y-3">
              {order.items.slice(0, 4).map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0 relative">
                    {item.product?.images?.[0] ? (
                      <Image
                        src={item.product.images[0].imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-300 text-xs">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{item.product?.name || 'Product'}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">${Number(item.priceAtPurchase).toFixed(2)}</p>
                </div>
              ))}
              {order.items.length > 4 && (
                <p className="text-xs text-[#2563eb]">+ {order.items.length - 4} more item{order.items.length - 4 > 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/orders/${id}`}
            className="flex-1 bg-[#fbbf24] text-[#0F1111] px-6 py-3 rounded-full font-semibold hover:bg-[#f59e0b] transition-colors text-center border border-[#FCD200]"
          >
            View Order Details
          </Link>
          <Link
            href="/products"
            className="flex-1 bg-white text-[#0F1111] px-6 py-3 rounded-full font-semibold border border-[#D5D9D9] hover:bg-[#F7FAFA] transition-colors text-center"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Guest Account Conversion Prompt */}
        {isGuestOrder && !userId && (
          <div className="bg-white rounded-lg border border-blue-200 p-6 mt-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                <svg className="w-6 h-6 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Create an account to track your order</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Sign up with <span className="font-medium">{order.guestEmail}</span> to view order history, track shipments, and check out faster next time.
                </p>
                <Link
                  href={`/register?email=${encodeURIComponent(order.guestEmail || '')}`}
                  className="inline-flex items-center gap-2 bg-[#2563eb] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#1d4ed8] transition-colors"
                >
                  Create Account
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
