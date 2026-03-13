interface StatusHistoryItem {
  id: string;
  status: string;
  notes?: string | null;
  changedBy?: string | null;
  createdAt: Date;
}

interface OrderStatusHistoryViewProps {
  statusHistory: StatusHistoryItem[];
  currentStatus?: string;
}

/**
 * Display order status change history with admin identifiers
 * Validates: Requirement 21.5
 */
export function OrderStatusHistoryView({
  statusHistory,
}: OrderStatusHistoryViewProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <div className="p-2 bg-gray-100 rounded-full">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'processing':
        return (
          <div className="p-2 bg-yellow-100 rounded-full">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        );
      case 'shipped':
        return (
          <div className="p-2 bg-blue-100 rounded-full">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
        );
      case 'delivered':
        return (
          <div className="p-2 bg-green-100 rounded-full">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'cancelled':
        return (
          <div className="p-2 bg-red-100 rounded-full">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="p-2 bg-gray-100 rounded-full">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Status History</h2>
      </div>
      <div className="p-6">
        {statusHistory.length === 0 ? (
          <p className="text-sm text-gray-500">No status history available</p>
        ) : (
          <div className="space-y-4">
            {statusHistory.map((item, index) => (
              <div key={item.id} className="relative">
                {/* Timeline Line */}
                {index < statusHistory.length - 1 && (
                  <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-200" />
                )}

                {/* Status Item */}
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {getStatusIcon(item.status)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {item.status}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(item.createdAt).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Admin Identifier */}
                    {item.changedBy && (
                      <p className="text-xs text-gray-500 mt-1">
                        Changed by: Admin ID {item.changedBy.substring(0, 8)}...
                      </p>
                    )}

                    {/* Notes */}
                    {item.notes && (
                      <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
