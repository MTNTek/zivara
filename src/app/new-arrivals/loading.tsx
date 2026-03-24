export default function NewArrivalsLoading() {
  const s = 'skeleton-shimmer';
  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="px-4 sm:px-6 lg:px-10 py-6">
        <div className={`h-4 w-28 ${s} rounded mb-4`} />
        <div className="bg-white rounded-lg p-6 mb-6">
          <div className={`h-7 w-36 ${s} rounded mb-2`} />
          <div className={`h-4 w-56 ${s} rounded`} />
        </div>
        <div className="bg-white rounded-lg p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i}>
                <div className={`aspect-square ${s} rounded mb-2`} />
                <div className={`h-3 w-full ${s} rounded mb-1`} />
                <div className={`h-3 w-3/4 ${s} rounded mb-1`} />
                <div className={`h-4 w-16 ${s} rounded`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
