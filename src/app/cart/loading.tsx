export default function CartLoading() {
  const s = 'skeleton-shimmer';
  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="px-4 sm:px-6 lg:px-10 py-8">
        <div className="flex items-center gap-1 mb-4">
          <div className={`h-3 w-10 ${s} rounded`} />
          <div className={`h-3 w-2 ${s} rounded`} />
          <div className={`h-3 w-8 ${s} rounded`} />
        </div>
        <div className={`h-8 w-40 ${s} rounded mb-8`} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[2, 1].map((count, gi) => (
              <div key={gi} className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <div className={`h-4 w-20 ${s} rounded`} />
                    <div className={`h-4 w-28 ${s} rounded`} />
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {[...Array(count)].map((_, i) => (
                    <div key={i} className="p-6 flex gap-4">
                      <div className={`w-24 h-24 ${s} rounded flex-shrink-0`} />
                      <div className="flex-1 space-y-2">
                        <div className={`h-5 w-3/4 ${s} rounded`} />
                        <div className={`h-4 w-20 ${s} rounded`} />
                        <div className="flex items-center gap-2">
                          <div className={`h-8 w-8 ${s} rounded`} />
                          <div className={`h-8 w-10 ${s} rounded`} />
                          <div className={`h-8 w-8 ${s} rounded`} />
                        </div>
                      </div>
                      <div className={`h-5 w-16 ${s} rounded`} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <div className={`h-5 w-32 ${s} rounded mb-4`} />
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className={`h-4 w-16 ${s} rounded`} />
                  <div className={`h-4 w-16 ${s} rounded`} />
                </div>
                <div className="flex justify-between">
                  <div className={`h-4 w-20 ${s} rounded`} />
                  <div className={`h-4 w-12 ${s} rounded`} />
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <div className={`h-5 w-12 ${s} rounded`} />
                    <div className={`h-5 w-20 ${s} rounded`} />
                  </div>
                </div>
                <div className={`h-12 w-full ${s} rounded-lg mt-4`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
