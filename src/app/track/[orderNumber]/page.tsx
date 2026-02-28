import { notFound } from 'next/navigation';
import { getOrderByNumber } from '@/features/orders/queries';
import OrderTrackingView from '@/components/order/order-tracking-view';

/**
 * Order tracking page - guest accessible
 * Validates: Requirements 23.1-23.7
 */
export default async function TrackOrderPage({
  params,
}: {
  params: { orderNumber: string };
}) {
  const order = await getOrderByNumber(params.orderNumber);

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <OrderTrackingView order={order} />
      </div>
    </div>
  );
}
