import { getAllOrders } from '@/features/orders/queries';
import { getOrderStatistics } from '@/features/admin/order-queries';
import { requireAdmin } from '@/lib/auth';
import Link from 'next/link';
import { OrderFilters } from '@/components/admin/order-filters';
import { OrderListTable } from '@/components/admin/order-list-table';
import { OrderStatistics } from '@/components/admin/order-statistics';
import { OrderExportButton } from '@/components/admin/order-export-button';

export const dynamic = 'force-dynamic';

interface SearchParams {
  page?: string;
  limit?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
  orderNumber?: string;
  sortBy?: 'date' | 'total' | 'status';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Admin order management interface
 * Validates: Requirements 21.1, 21.2, 21.7
 */
export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || '1');
  const limit = parseInt(resolvedParams.limit || '20');
  const status = resolvedParams.status;
  const startDate = resolvedParams.startDate ? new Date(resolvedParams.startDate) : undefined;
  const endDate = resolvedParams.endDate ? new Date(resolvedParams.endDate) : undefined;
  const userId = resolvedParams.userId;
  const orderNumber = resolvedParams.orderNumber;
  const sortBy = resolvedParams.sortBy || 'date';
  const sortOrder = resolvedParams.sortOrder || 'desc';

  // Get orders with filters
  const { orders, pagination } = await getAllOrders({
    page,
    limit,
    status,
    startDate,
    endDate,
    userId,
    orderNumber,
    sortBy,
    sortOrder,
  });

  // Get order statistics
  const statistics = await getOrderStatistics({
    status,
    startDate,
    endDate,
    userId,
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
              <p className="mt-2 text-gray-600">View and manage customer orders</p>
            </div>
            <div className="flex gap-4">
              <OrderExportButton
                filters={{
                  status,
                  startDate: resolvedParams.startDate,
                  endDate: resolvedParams.endDate,
                  orderNumber,
                }}
              />
              <Link
                href="/admin/dashboard"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Order Statistics */}
        <OrderStatistics statistics={statistics} />

        {/* Filters */}
        <OrderFilters
          currentFilters={{
            status,
            startDate: resolvedParams.startDate,
            endDate: resolvedParams.endDate,
            orderNumber,
          }}
        />

        {/* Orders Table */}
        <OrderListTable
          orders={orders}
          pagination={pagination}
          currentPage={page}
          currentLimit={limit}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      </div>
    </div>
  );
}
