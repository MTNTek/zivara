export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-[#EAEDED] animate-pulse">
      {/* Hero skeleton */}
      <div className="h-[400px] bg-gray-200" />

      {/* Category cards skeleton */}
      <div className="px-4 sm:px-6 lg:px-10 -mt-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[14px]">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6">
              <div className="h-5 w-32 bg-gray-200 rounded mb-3" />
              <div className="grid grid-cols-2 gap-2">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="aspect-square bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product row skeleton */}
      <div className="px-4 sm:px-6 lg:px-10 mt-[14px]">
        <div className="bg-white p-5">
          <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
          <div className="flex gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[200px]">
                <div className="w-[200px] h-[200px] bg-gray-200 mb-2" />
                <div className="h-4 w-full bg-gray-200 rounded mb-1" />
                <div className="h-6 w-16 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
