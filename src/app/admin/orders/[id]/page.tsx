import { getOrderById } from '@/features/orders/queries';
import { requireAdmin } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { OrderDetailView } from '@/components/admin/order-detail-view';
import { OrderStatusUpdater } from '@/components/admin/order-status-updater';
import { OrderStatusHistoryView } from '@/components/admin/order-status-history';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Admin order detail page
 * Validates: Requirements 21.3, 21.4, 21.5
 */
export default async function AdminOrderDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
              <p className="mt-2 text-gray-600">Order #{order.orderNumber}</p>
            </div>
            <Link
              href="/admin/orders"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Orders
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Status Updater */}
            <OrderStatusUpdater
              orderId={order.id}
              currentStatus={order.status}
            />

            {/* Order Details */}
            <OrderDetailView order={order} />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Status History */}
            <OrderStatusHistoryView
              statusHistory={order.statusHistory || []}
              currentStatus={order.status}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
