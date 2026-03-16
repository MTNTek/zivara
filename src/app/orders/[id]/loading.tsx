export default function OrderDetailLoading() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      <div className="px-4 sm:px-6 lg:px-10 py-8">
        {/* Order Progress Timeline */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
          <div className="flex items-center justify-between">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 bg-gray-200 rounded-full" />
                <div className="h-3 w-16 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
          <div className="flex mt-[-20px] mb-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex-1 h-1 bg-gray-200 mx-4" />
            ))}
          </div>
        </div>

        {/* Header: Back link + Order number + Status badge */}
        <div className="mb-8">
          <div className="h-4 w-28 bg-gray-200 rounded mb-4" />
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 w-56 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-40 bg-gray-200 rounded" />
            </div>
            <div className="h-8 w-24 bg-gray-200 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column (2 cols): Items + Shipping + Sub-orders */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-5 w-28 bg-gray-200 rounded mb-4" />
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 bg-gray-200 rounded" />
                      <div className="h-3 w-20 bg-gray-200 rounded" />
                      <div className="h-3 w-24 bg-gray-200 rounded" />
                    </div>
                    <div className="h-4 w-16 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-5 w-36 bg-gray-200 rounded mb-4" />
              <div className="space-y-2">
                <div className="h-4 w-48 bg-gray-200 rounded" />
                <div className="h-4 w-40 bg-gray-200 rounded" />
                <div className="h-4 w-32 bg-gray-200 rounded" />
              </div>
            </div>

            {/* Shipment Details (sub-orders) */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-5 w-36 bg-gray-200 rounded mb-4" />
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-24 bg-gray-200 rounded" />
                        <div className="h-3 w-32 bg-gray-200 rounded" />
                      </div>
                      <div className="h-5 w-20 bg-gray-200 rounded-full" />
                    </div>
                    <div className="h-3 w-40 bg-gray-200 rounded mb-1" />
                    <div className="h-3 w-36 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column (1 col): Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-8 bg-gray-200 rounded" />
                  <div className="h-4 w-12 bg-gray-200 rounded" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                  <div className="h-4 w-12 bg-gray-200 rounded" />
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <div className="h-5 w-12 bg-gray-200 rounded" />
                    <div className="h-5 w-20 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
              {/* Tracking info */}
              <div className="border-t border-gray-200 pt-4">
                <div className="h-4 w-36 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-28 bg-gray-200 rounded mb-1" />
                <div className="h-3 w-32 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
