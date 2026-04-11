'use client';

const STEPS = [
  { key: 'pending', label: 'Order Placed', icon: '📦' },
  { key: 'processing', label: 'Processing', icon: '⚙️' },
  { key: 'shipped', label: 'Shipped', icon: '🚚' },
  { key: 'delivered', label: 'Delivered', icon: '✅' },
] as const;

const STATUS_INDEX: Record<string, number> = {
  pending: 0,
  processing: 1,
  shipped: 2,
  delivered: 3,
  cancelled: -1,
  return_requested: -2,
  returned: -2,
  refunded: -2,
};

function getEstimatedDate(orderDate: string | undefined, stepIndex: number): string {
  if (!orderDate) return '';
  const base = new Date(orderDate);
  if (isNaN(base.getTime())) return '';
  const daysToAdd = [0, 1, 3, 5][stepIndex] ?? 0;
  const est = new Date(base);
  est.setDate(est.getDate() + daysToAdd);
  return est.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface OrderTimelineProps {
  status: string;
  orderDate?: string;
}

export function OrderTimeline({ status, orderDate }: OrderTimelineProps) {
  if (status === 'return_requested') {
    return (
      <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
          <span className="text-lg">↩️</span>
        </div>
        <div>
          <span className="font-semibold text-orange-700">Return Requested</span>
          <p className="text-sm text-orange-600 mt-0.5">Your return request is being reviewed. We&apos;ll notify you once it&apos;s processed.</p>
        </div>
      </div>
    );
  }

  if (status === 'returned' || status === 'refunded') {
    return (
      <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
          <span className="text-lg">💰</span>
        </div>
        <div>
          <span className="font-semibold text-purple-700">{status === 'refunded' ? 'Refunded' : 'Returned'}</span>
          <p className="text-sm text-purple-600 mt-0.5">
            {status === 'refunded' ? 'Your refund has been processed. It may take 5-10 business days to appear.' : 'Your return has been approved and a refund is being processed.'}
          </p>
        </div>
      </div>
    );
  }

  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div>
          <span className="font-semibold text-red-700">Order Cancelled</span>
          <p className="text-sm text-red-600 mt-0.5">
            This order was cancelled{orderDate ? ` on ${new Date(orderDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : ''}. If you were charged, a refund will be processed within 5-10 business days.
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = STATUS_INDEX[status] ?? 0;

  return (
    <div>
      {/* Desktop timeline */}
      <div className="hidden sm:flex items-start justify-between">
        {STEPS.map((step, i) => {
          const isComplete = i <= currentIndex;
          const isCurrent = i === currentIndex;
          const estDate = getEstimatedDate(orderDate, i);
          return (
            <div key={step.key} className="flex-1 flex items-start">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500 ${
                    isComplete
                      ? 'bg-[#2563eb] text-white shadow-md'
                      : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                  } ${isCurrent ? 'ring-4 ring-[#2563eb]/20 scale-110' : ''}`}
                >
                  {isComplete ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-base">{step.icon}</span>
                  )}
                </div>
                <span className={`text-xs mt-2 font-medium transition-colors ${isComplete ? 'text-[#2563eb]' : 'text-gray-400'}`}>
                  {step.label}
                </span>
                {estDate && (
                  <span className={`text-[10px] mt-0.5 ${isComplete ? 'text-[#2563eb]' : 'text-gray-400'}`}>
                    {i <= currentIndex ? (i === 0 ? estDate : estDate) : `Est. ${estDate}`}
                  </span>
                )}
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 mx-1 mt-5 relative h-0.5">
                  <div className="absolute inset-0 bg-gray-200 rounded-full" />
                  <div
                    className={`absolute inset-y-0 left-0 bg-[#2563eb] rounded-full transition-all duration-700 ease-out ${
                      i < currentIndex ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile vertical timeline */}
      <div className="sm:hidden space-y-0">
        {STEPS.map((step, i) => {
          const isComplete = i <= currentIndex;
          const isCurrent = i === currentIndex;
          const estDate = getEstimatedDate(orderDate, i);
          return (
            <div key={step.key} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-500 ${
                    isComplete
                      ? 'bg-[#2563eb] text-white'
                      : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                  } ${isCurrent ? 'ring-3 ring-[#2563eb]/20' : ''}`}
                >
                  {isComplete ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-sm">{step.icon}</span>
                  )}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-0.5 h-8 relative">
                    <div className="absolute inset-0 bg-gray-200" />
                    <div className={`absolute inset-x-0 top-0 bg-[#2563eb] transition-all duration-500 ${i < currentIndex ? 'h-full' : 'h-0'}`} />
                  </div>
                )}
              </div>
              <div className={`pb-6 ${i === STEPS.length - 1 ? 'pb-0' : ''}`}>
                <span className={`text-sm font-medium ${isComplete ? 'text-[#2563eb]' : 'text-gray-400'}`}>
                  {step.label}
                </span>
                {estDate && (
                  <span className={`block text-xs mt-0.5 ${isComplete ? 'text-[#2563eb]' : 'text-gray-400'}`}>
                    {i <= currentIndex ? estDate : `Est. ${estDate}`}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
