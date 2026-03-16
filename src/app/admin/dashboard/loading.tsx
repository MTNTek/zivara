export default function AdminDashboardLoading() {
  return (
    <div className="animate-pulse">
      {/* Welcome message */}
      <div className="mb-6">
        <div className="h-4 w-56 bg-gray-200 rounded" />
      </div>

      {/* Statistics Cards: 3x2 grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                <div className="h-8 w-28 bg-gray-200 rounded" />
              </div>
              <div className="h-14 w-14 bg-gray-200 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Cards: 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gray-200 rounded-lg" />
              <div>
                <div className="h-5 w-20 bg-gray-200 rounded mb-1" />
                <div className="h-3 w-32 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="h-6 w-32 bg-gray-200 rounded" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['w-28', 'w-32', 'w-20', 'w-16', 'w-20'].map((w, i) => (
                  <th key={i} className="px-6 py-3 text-left">
                    <div className={`h-3 ${w} bg-gray-200 rounded`} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-28 bg-gray-200 rounded mb-1" />
                    <div className="h-3 w-36 bg-gray-200 rounded" />
                  </td>
                  <td className="px-6 py-4"><div className="h-5 w-20 bg-gray-200 rounded-full" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 rounded" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
