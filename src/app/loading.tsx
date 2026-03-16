export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-[#EAEDED] animate-pulse">
      {/* Hero carousel skeleton */}
      <div className="h-[300px] sm:h-[400px] bg-gray-300" />

      {/* Category strip skeleton */}
      <div className="relative z-10 -mt-10 sm:-mt-16">
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex gap-4 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-4 w-20 bg-gray-200 rounded flex-shrink-0" />
          ))}
        </div>
      </div>

      {/* Category cards grid */}
      <div className="px-4 sm:px-6 lg:px-10 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[14px]">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6">
              <div className="h-5 w-32 bg-gray-200 rounded mb-3" />
              <div className="grid grid-cols-2 gap-2">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="aspect-square bg-gray-200 rounded" />
                ))}
              </div>
              <div className="h-3 w-16 bg-gray-200 rounded mt-3" />
            </div>
          ))}
        </div>
      </div>

      {/* Product rows */}
      <div className="px-4 sm:px-6 lg:px-10 mt-[14px] space-y-[14px] pb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-5">
            <div className="flex items-baseline justify-between mb-3">
              <div className="h-6 w-48 bg-gray-200 rounded" />
              <div className="h-3 w-20 bg-gray-200 rounded" />
            </div>
            <div className="flex gap-2 overflow-hidden">
              {[...Array(6)].map((_, j) => (
                <div key={j} className="flex-shrink-0 w-[180px]">
                  <div className="w-[180px] h-[180px] bg-gray-200 mb-2" />
                  <div className="h-4 w-full bg-gray-200 rounded mb-1" />
                  <div className="h-3 w-20 bg-gray-200 rounded mb-1" />
                  <div className="h-6 w-16 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Featured products grid */}
        <div className="bg-white p-5">
          <div className="flex items-baseline justify-between mb-3">
            <div className="h-6 w-48 bg-gray-200 rounded" />
            <div className="h-3 w-24 bg-gray-200 rounded" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-5">
            {[...Array(10)].map((_, i) => (
              <div key={i}>
                <div className="aspect-square bg-gray-200 mb-2" />
                <div className="h-4 w-full bg-gray-200 rounded mb-1" />
                <div className="h-4 w-3/4 bg-gray-200 rounded mb-1" />
                <div className="h-6 w-16 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Promo banners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px]">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-5">
              <div className="h-5 w-32 bg-gray-200 rounded mb-1" />
              <div className="h-4 w-48 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-16 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
