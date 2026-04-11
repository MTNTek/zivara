export default function WishlistLoading() {
  const s = 'skeleton-shimmer';
  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="px-4 sm:px-6 lg:px-10 py-8">
        <div className={`h-8 w-48 ${s} rounded mb-8`} />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-6">
          {[...Array(8)].map((_, i) => (
            <div key={i}>
              <div className={`aspect-square ${s} mb-2`} />
              <div className={`h-4 w-full ${s} rounded mb-1`} />
              <div className={`h-3 w-20 ${s} rounded mb-1`} />
              <div className={`h-6 w-16 ${s} rounded`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
