export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-[#EAEDED]">
      {/* Hero carousel skeleton */}
      <div className="h-[300px] sm:h-[400px] skeleton-shimmer" />

      {/* Category strip skeleton */}
      <div className="relative z-10 -mt-10 sm:-mt-16">
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex gap-4 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-4 w-20 skeleton-shimmer rounded flex-shrink-0" />
          ))}
        </div>
      </div>

      {/* Category cards grid */}
      <div className="px-4 sm:px-6 lg:px-10 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[14px]">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6">
              <div className="h-5 w-32 skeleton-shimmer rounded mb-3" />
              <div className="grid grid-cols-2 gap-2">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="aspect-square skeleton-shimmer rounded" />
                ))}
              </div>
              <div className="h-3 w-16 skeleton-shimmer rounded mt-3" />
            </div>
          ))}
        </div>
      </div>

      {/* Product rows */}
      <div className="px-4 sm:px-6 lg:px-10 mt-[14px] space-y-[14px] pb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-5">
            <div className="flex items-baseline justify-between mb-3">
              <div className="h-6 w-48 skeleton-shimmer rounded" />
              <div className="h-3 w-20 skeleton-shimmer rounded" />
            </div>
            <div className="flex gap-2 overflow-hidden">
              {[...Array(6)].map((_, j) => (
                <div key={j} className="flex-shrink-0 w-[180px]">
                  <div className="w-[180px] h-[180px] skeleton-shimmer mb-2" />
                  <div className="h-4 w-full skeleton-shimmer rounded mb-1" />
                  <div className="h-3 w-20 skeleton-shimmer rounded mb-1" />
                  <div className="h-6 w-16 skeleton-shimmer rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Featured products grid */}
        <div className="bg-white p-5">
          <div className="flex items-baseline justify-between mb-3">
            <div className="h-6 w-48 skeleton-shimmer rounded" />
            <div className="h-3 w-24 skeleton-shimmer rounded" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-5">
            {[...Array(10)].map((_, i) => (
              <div key={i}>
                <div className="aspect-square skeleton-shimmer mb-2" />
                <div className="h-4 w-full skeleton-shimmer rounded mb-1" />
                <div className="h-4 w-3/4 skeleton-shimmer rounded mb-1" />
                <div className="h-6 w-16 skeleton-shimmer rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
