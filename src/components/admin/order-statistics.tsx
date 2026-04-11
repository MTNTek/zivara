import { OrderStatistics as OrderStatsType } from '@/features/admin/order-queries';

interface OrderStatisticsProps {
  statistics: OrderStatsType;
}

/**
 * Display order statistics for admin
 * Validates: Requirement 21.7
 */
export function OrderStatistics({ statistics }: OrderStatisticsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Revenue */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              ${parseFloat(statistics.totalRevenue).toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Average Order Value */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Average Order Value</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              ${parseFloat(statistics.averageOrderValue).toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Total Orders */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Orders</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {statistics.totalOrders}
            </p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
