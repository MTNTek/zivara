export default function OrdersLoading() {
  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="px-4 sm:px-6 lg:px-10 py-6">
        <div className="h-4 w-20 skeleton-shimmer rounded mb-4" />
        <div className="h-7 w-40 skeleton-shimmer rounded mb-4" />

        {/* Filter skeleton */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 h-10 skeleton-shimmer rounded-lg" />
            <div className="w-36 h-10 skeleton-shimmer rounded-lg" />
            <div className="w-36 h-10 skeleton-shimmer rounded-lg" />
          </div>
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-[#F0F2F2] border-b border-[#D5D9D9] px-6 py-3 flex gap-6">
                <div className="space-y-1">
                  <div className="h-3 w-20 skeleton-shimmer rounded" />
                  <div className="h-3 w-28 skeleton-shimmer rounded" />
                </div>
                <div className="space-y-1">
                  <div className="h-3 w-12 skeleton-shimmer rounded" />
                  <div className="h-3 w-16 skeleton-shimmer rounded" />
                </div>
              </div>
              <div className="px-6 py-4 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2].map((j) => (
                    <div key={j} className="w-12 h-12 rounded skeleton-shimmer border-2 border-white" />
                  ))}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-48 skeleton-shimmer rounded" />
                  <div className="h-3 w-16 skeleton-shimmer rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
