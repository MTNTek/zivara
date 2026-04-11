export default function CategoryLoading() {
  const s = 'skeleton-shimmer';
  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="px-4 sm:px-6 lg:px-10 py-4">
        <div className="flex items-center gap-2 mb-3">
          <div className={`h-3 w-16 ${s} rounded`} />
          <span className="text-gray-300">›</span>
          <div className={`h-3 w-20 ${s} rounded`} />
        </div>
        <div className="mb-4">
          <div className={`h-6 w-48 ${s} rounded`} />
          <div className={`h-3 w-72 ${s} rounded mt-2`} />
        </div>
        <div className="flex">
          <div className="hidden lg:block w-[220px] flex-shrink-0 space-y-3 pr-5 border-r border-[#e7e7e7]">
            {[70, 85, 60, 90, 75, 65, 80, 70].map((w, i) => (
              <div key={i} className={`h-4 ${s} rounded`} style={{ width: `${w}%` }} />
            ))}
            <div className="border-t border-gray-200 my-3" />
            <div className={`h-4 w-12 ${s} rounded`} />
            {[55, 70, 60, 50, 65].map((w, i) => (
              <div key={i} className={`h-4 ${s} rounded`} style={{ width: `${w}%` }} />
            ))}
          </div>
          <div className="flex-1 pl-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
              <div className={`h-4 w-48 ${s} rounded`} />
              <div className={`h-8 w-32 ${s} rounded`} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i}>
                  <div className={`aspect-square ${s} rounded mb-2`} />
                  <div className={`h-3 ${s} rounded mb-1`} />
                  <div className={`h-3 w-3/4 ${s} rounded mb-1`} />
                  <div className={`h-4 w-16 ${s} rounded`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
