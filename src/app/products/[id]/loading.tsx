export default function ProductDetailLoading() {
  const s = 'skeleton-shimmer';
  return (
    <div className="min-h-screen bg-[#EAEDED]">
      {/* Breadcrumbs bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-10 py-2 flex items-center gap-1">
          <div className={`h-3 w-10 ${s} rounded`} />
          <div className={`h-3 w-2 ${s} rounded`} />
          <div className={`h-3 w-14 ${s} rounded`} />
          <div className={`h-3 w-2 ${s} rounded`} />
          <div className={`h-3 w-20 ${s} rounded`} />
          <div className={`h-3 w-2 ${s} rounded`} />
          <div className={`h-3 w-32 ${s} rounded`} />
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-10 py-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <div className={`aspect-square ${s} rounded mb-3`} />
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`w-16 h-16 ${s} rounded`} />
                ))}
              </div>
            </div>
            <div className="lg:col-span-4 space-y-3">
              <div className={`h-6 w-3/4 ${s} rounded`} />
              <div className={`h-4 w-40 ${s} rounded`} />
              <div className="flex items-center gap-2">
                <div className={`h-4 w-8 ${s} rounded`} />
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`h-4 w-4 ${s} rounded`} />
                  ))}
                </div>
                <div className={`h-4 w-16 ${s} rounded`} />
              </div>
              <div className="h-px bg-gray-200 my-3" />
              <div className="flex items-center gap-2">
                <div className={`h-5 w-10 ${s} rounded`} />
                <div className={`h-8 w-24 ${s} rounded`} />
              </div>
              <div className={`h-3 w-28 ${s} rounded`} />
              <div className="h-px bg-gray-200 my-3" />
              <div className={`h-4 w-28 ${s} rounded`} />
              <div className="space-y-2">
                {[1, 1, 0.75, 0.85].map((w, i) => (
                  <div key={i} className={`h-3 ${s} rounded`} style={{ width: `${w * 100}%` }} />
                ))}
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="border border-gray-300 rounded-lg p-4 space-y-3">
                <div className={`h-5 w-20 ${s} rounded`} />
                <div className={`h-4 w-full ${s} rounded`} />
                <div className={`h-5 w-16 ${s} rounded`} />
                <div className={`h-10 w-full ${s} rounded-full`} />
                <div className={`h-10 w-full ${s} rounded-full`} />
              </div>
            </div>
          </div>
        </div>

        {/* Reviews skeleton */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
          <div className={`h-5 w-36 ${s} rounded mb-6`} />
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="pb-4 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`h-8 w-8 ${s} rounded-full`} />
                  <div className={`h-3 w-24 ${s} rounded`} />
                </div>
                <div className={`h-3 w-full ${s} rounded mb-1`} />
                <div className={`h-3 w-2/3 ${s} rounded`} />
              </div>
            ))}
          </div>
        </div>

        {/* Related Products skeleton */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
          <div className={`h-5 w-52 ${s} rounded mb-4`} />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-5">
            {[...Array(6)].map((_, i) => (
              <div key={i}>
                <div className={`aspect-square ${s} rounded mb-1`} />
                <div className={`h-3 w-full ${s} rounded mb-1`} />
                <div className={`h-5 w-14 ${s} rounded`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
