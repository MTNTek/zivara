import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getOrderById } from '@/features/orders/queries';
import { getCurrentUserId } from '@/lib/auth';

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
  if (!userId) redirect('/login');

  const order = await getOrderById(id);
  if (!order || order.userId !== userId) notFound();

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 sm:px-6 lg:px-10 py-12 max-w-2xl">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed</h1>
          <p className="text-gray-600">
            Thank you for your purchase. We&apos;ll send a confirmation email shortly.
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="text-lg font-semibold text-gray-900">{order.orderNumber}</p>
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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/orders/${id}`}
            className="flex-1 bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors text-center"
          >
            View Order Details
          </Link>
          <Link
            href="/products"
            className="flex-1 bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-colors text-center"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
