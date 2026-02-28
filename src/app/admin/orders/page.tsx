import { getAllOrders } from '@/features/orders/queries';
import { getOrderStatistics } from '@/features/admin/order-queries';
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
  searchParams: SearchParams;
}) {
  const page = parseInt(searchParams.page || '1');
  const limit = parseInt(searchParams.limit || '20');
  const status = searchParams.status;
  const startDate = searchParams.startDate ? new Date(searchParams.startDate) : undefined;
  const endDate = searchParams.endDate ? new Date(searchParams.endDate) : undefined;
  const userId = searchParams.userId;
  const orderNumber = searchParams.orderNumber;
  const sortBy = searchParams.sortBy || 'date';
  const sortOrder = searchParams.sortOrder || 'desc';

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
    <div className="min-h-screen bg-gray-50">
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
                  startDate: searchParams.startDate,
                  endDate: searchParams.endDate,
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
            startDate: searchParams.startDate,
            endDate: searchParams.endDate,
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
