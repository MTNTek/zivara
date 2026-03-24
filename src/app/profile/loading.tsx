export default function ProfileLoading() {
  const s = 'skeleton-shimmer';
  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className={`h-8 ${s} rounded w-48`} />
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className={`h-6 ${s} rounded w-32`} />
            <div className="space-y-3">
              <div className={`h-10 ${s} rounded`} />
              <div className={`h-10 ${s} rounded`} />
              <div className={`h-10 ${s} rounded`} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className={`h-6 ${s} rounded w-40`} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`h-32 ${s} rounded`} />
              <div className={`h-32 ${s} rounded`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
