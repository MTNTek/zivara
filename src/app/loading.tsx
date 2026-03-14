export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      {/* Hero skeleton */}
      <div className="h-[400px] bg-gray-200" />

      {/* Category cards skeleton */}
      <div className="px-4 -mt-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-md">
              <div className="h-10 w-10 bg-gray-200 rounded mx-auto mb-2" />
              <div className="h-4 w-20 bg-gray-200 rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Products skeleton */}
      <div className="px-4 py-8">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="h-7 w-48 bg-gray-200 rounded mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-square bg-gray-200 rounded" />
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-16 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
