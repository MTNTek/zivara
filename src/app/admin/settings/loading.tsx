export default function SettingsLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm p-6">
          <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
          <div className="space-y-3">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
