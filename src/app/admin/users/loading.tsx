export default function UsersLoading() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header: Title + Back to Dashboard */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-40 bg-gray-200 rounded" />
            </div>
            <div className="h-10 w-36 bg-gray-200 rounded-lg" />
          </div>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <div className="h-10 w-full max-w-md bg-gray-200 rounded-lg" />
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['w-16', 'w-16', 'w-12', 'w-14', 'w-14', 'w-28', 'w-20'].map((w, i) => (
                    <th key={i} className="px-6 py-3 text-left">
                      <div className={`h-3 ${w} bg-gray-200 rounded`} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[...Array(10)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-4 w-28 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-40 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-16 bg-gray-200 rounded-full" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-14 bg-gray-200 rounded-full" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-8 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                    <td className="px-6 py-4 text-right"><div className="h-4 w-20 bg-gray-200 rounded ml-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
