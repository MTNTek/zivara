export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] animate-pulse">
      {/* Breadcrumbs bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-10 py-2 flex items-center gap-1">
          <div className="h-3 w-10 bg-gray-200 rounded" />
          <div className="h-3 w-2 bg-gray-200 rounded" />
          <div className="h-3 w-14 bg-gray-200 rounded" />
          <div className="h-3 w-2 bg-gray-200 rounded" />
          <div className="h-3 w-20 bg-gray-200 rounded" />
          <div className="h-3 w-2 bg-gray-200 rounded" />
          <div className="h-3 w-32 bg-gray-200 rounded" />
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-10 py-6">
        {/* Main product card: 3-column Amazon layout */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Image gallery (5 cols) */}
            <div className="lg:col-span-5">
              <div className="aspect-square bg-gray-200 rounded mb-3" />
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-16 h-16 bg-gray-200 rounded" />
                ))}
              </div>
            </div>

            {/* Middle: Product details (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="h-6 w-3/4 bg-gray-200 rounded" />
              <div className="h-4 w-40 bg-gray-200 rounded" />
              <div className="h-3 w-32 bg-gray-200 rounded" />
              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="h-4 w-8 bg-gray-200 rounded" />
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-4 w-4 bg-gray-200 rounded" />
                  ))}
                </div>
                <div className="h-4 w-16 bg-gray-200 rounded" />
              </div>
              <div className="h-px bg-gray-200 my-3" />
              {/* Price */}
              <div className="flex items-center gap-2">
                <div className="h-5 w-10 bg-gray-200 rounded" />
                <div className="h-8 w-24 bg-gray-200 rounded" />
              </div>
              <div className="h-3 w-28 bg-gray-200 rounded" />
              <div className="h-px bg-gray-200 my-3" />
              {/* About this item */}
              <div className="h-4 w-28 bg-gray-200 rounded" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-200 rounded" />
                <div className="h-3 w-full bg-gray-200 rounded" />
                <div className="h-3 w-3/4 bg-gray-200 rounded" />
                <div className="h-3 w-5/6 bg-gray-200 rounded" />
              </div>
              <div className="h-3 w-24 bg-gray-200 rounded" />
            </div>

            {/* Right: Buy box (3 cols) */}
            <div className="lg:col-span-3">
              <div className="border border-gray-300 rounded-lg p-4 space-y-3">
                <div className="h-5 w-20 bg-gray-200 rounded" />
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-5 w-16 bg-gray-200 rounded" />
                <div className="h-10 w-full bg-gray-200 rounded-full" />
                <div className="h-10 w-full bg-gray-200 rounded-full" />
                <div className="h-px bg-gray-200" />
                <div className="flex gap-3">
                  <div className="h-8 w-8 bg-gray-200 rounded" />
                  <div className="h-8 w-8 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Frequently Bought Together */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="h-5 w-52 bg-gray-200 rounded mb-4" />
          <div className="flex items-center gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-28 h-28 bg-gray-200 rounded" />
                {i < 2 && <div className="h-6 w-6 bg-gray-200 rounded-full" />}
              </div>
            ))}
            <div className="ml-auto space-y-2">
              <div className="h-5 w-24 bg-gray-200 rounded" />
              <div className="h-9 w-32 bg-gray-200 rounded" />
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
          <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
          <div className="space-y-2 max-w-3xl">
            <div className="h-3 w-full bg-gray-200 rounded" />
            <div className="h-3 w-full bg-gray-200 rounded" />
            <div className="h-3 w-2/3 bg-gray-200 rounded" />
          </div>
        </div>

        {/* Customer Reviews */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
          <div className="h-5 w-36 bg-gray-200 rounded mb-6" />
          {/* Rating summary */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-5 w-5 bg-gray-200 rounded" />
              ))}
            </div>
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </div>
          {/* Review items */}
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="pb-4 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 bg-gray-200 rounded-full" />
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                </div>
                <div className="flex gap-0.5 mb-1">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="h-4 w-4 bg-gray-200 rounded" />
                  ))}
                </div>
                <div className="h-3 w-full bg-gray-200 rounded mb-1" />
                <div className="h-3 w-2/3 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Write a Review */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
          <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
          <div className="h-3 w-64 bg-gray-200 rounded mb-4" />
          <div className="h-24 w-full bg-gray-200 rounded" />
        </div>

        {/* Related Products */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
          <div className="h-5 w-52 bg-gray-200 rounded mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-5">
            {[...Array(6)].map((_, i) => (
              <div key={i}>
                <div className="aspect-square bg-gray-200 rounded mb-1" />
                <div className="h-3 w-full bg-gray-200 rounded mb-1" />
                <div className="h-5 w-14 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
