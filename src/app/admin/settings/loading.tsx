export default function SettingsLoading() {
  const s = 'skeleton-shimmer';
  return (
    <div className="space-y-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm p-6">
          <div className={`h-6 w-40 ${s} rounded mb-4`} />
          <div className="space-y-3">
            <div className={`h-4 w-24 ${s} rounded`} />
            <div className={`h-10 w-full ${s} rounded`} />
            <div className={`h-4 w-24 ${s} rounded`} />
            <div className={`h-10 w-full ${s} rounded`} />
          </div>
        </div>
      ))}
    </div>
  );
}
