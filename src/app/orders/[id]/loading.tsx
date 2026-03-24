export default function OrderDetailLoading() {
  const s = 'skeleton-shimmer';
  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="px-4 sm:px-6 lg:px-10 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className={`h-5 w-32 ${s} rounded mb-4`} />
          <div className="flex items-center justify-between">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className={`h-8 w-8 ${s} rounded-full`} />
                <div className={`h-3 w-16 ${s} rounded`} />
              </div>
            ))}
          </div>
          <div className="flex mt-[-20px] mb-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`flex-1 h-1 ${s} mx-4`} />
            ))}
          </div>
        </div>
        <div className="mb-8">
          <div className={`h-4 w-28 ${s} rounded mb-4`} />
          <div className="flex items-center justify-between">
            <div>
              <div className={`h-8 w-56 ${s} rounded mb-2`} />
              <div className={`h-4 w-40 ${s} rounded`} />
            </div>
            <div className={`h-8 w-24 ${s} rounded-full`} />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className={`h-5 w-28 ${s} rounded mb-4`} />
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                    <div className={`w-20 h-20 ${s} rounded-lg flex-shrink-0`} />
                    <div className="flex-1 space-y-2">
                      <div className={`h-4 w-48 ${s} rounded`} />
                      <div className={`h-3 w-20 ${s} rounded`} />
                      <div className={`h-3 w-24 ${s} rounded`} />
                    </div>
                    <div className={`h-4 w-16 ${s} rounded`} />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className={`h-5 w-36 ${s} rounded mb-4`} />
              <div className="space-y-2">
                <div className={`h-4 w-48 ${s} rounded`} />
                <div className={`h-4 w-40 ${s} rounded`} />
                <div className={`h-4 w-32 ${s} rounded`} />
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <div className={`h-5 w-32 ${s} rounded mb-4`} />
              <div className="space-y-3 mb-6">
                {[['w-16','w-16'],['w-8','w-12'],['w-16','w-12']].map(([l,r], i) => (
                  <div key={i} className="flex justify-between">
                    <div className={`h-4 ${l} ${s} rounded`} />
                    <div className={`h-4 ${r} ${s} rounded`} />
                  </div>
                ))}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <div className={`h-5 w-12 ${s} rounded`} />
                    <div className={`h-5 w-20 ${s} rounded`} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
