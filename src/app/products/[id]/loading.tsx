export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      <div className="px-4 sm:px-6 lg:px-10 py-8">
        {/* Breadcrumbs skeleton */}
        <div className="mb-6 flex gap-2">
          <div className="h-4 w-12 bg-gray-200 rounded" />
          <div className="h-4 w-4 bg-gray-200 rounded" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
          <div className="h-4 w-4 bg-gray-200 rounded" />
          <div className="h-4 w-24 bg-gray-200 rounded" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image skeleton */}
          <div className="aspect-square bg-gray-200 rounded-lg" />

          {/* Info skeleton */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div className="h-8 w-3/4 bg-gray-200 rounded" />
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-5 w-5 bg-gray-200 rounded" />
              ))}
            </div>
            <div className="h-10 w-32 bg-gray-200 rounded" />
            <div className="h-5 w-20 bg-gray-200 rounded" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-2/3 bg-gray-200 rounded" />
            </div>
            <div className="h-12 w-full bg-gray-200 rounded-lg" />
          </div>
        </div>

        {/* Reviews skeleton */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="h-7 w-48 bg-gray-200 rounded mb-6" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border-b border-gray-100 pb-4">
                <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-full bg-gray-200 rounded mb-1" />
                <div className="h-4 w-2/3 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
