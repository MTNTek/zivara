export default function AdminDashboardLoading() {
  const s = 'skeleton-shimmer';
  return (
    <div>
      <div className="mb-6">
        <div className={`h-4 w-56 ${s} rounded`} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className={`h-4 w-24 ${s} rounded mb-2`} />
                <div className={`h-8 w-28 ${s} rounded`} />
              </div>
              <div className={`h-14 w-14 ${s} rounded-full`} />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-4">
              <div className={`h-12 w-12 ${s} rounded-lg`} />
              <div>
                <div className={`h-5 w-20 ${s} rounded mb-1`} />
                <div className={`h-3 w-32 ${s} rounded`} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className={`h-6 w-32 ${s} rounded`} />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['w-28', 'w-32', 'w-20', 'w-16', 'w-20'].map((w, i) => (
                  <th key={i} className="px-6 py-3 text-left">
                    <div className={`h-3 ${w} ${s} rounded`} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><div className={`h-4 w-24 ${s} rounded`} /></td>
                  <td className="px-6 py-4">
                    <div className={`h-4 w-28 ${s} rounded mb-1`} />
                    <div className={`h-3 w-36 ${s} rounded`} />
                  </td>
                  <td className="px-6 py-4"><div className={`h-5 w-20 ${s} rounded-full`} /></td>
                  <td className="px-6 py-4"><div className={`h-4 w-16 ${s} rounded`} /></td>
                  <td className="px-6 py-4"><div className={`h-4 w-20 ${s} rounded`} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
