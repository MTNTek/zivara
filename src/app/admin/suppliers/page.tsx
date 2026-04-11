import { db } from '@/db';
import { suppliers, productSupplierLinks, subOrders, syncJobs } from '@/db/schema';
import { eq, sql, count, desc, and, inArray } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminSuppliersPage() {
  await requireAdmin();

  // Fetch all suppliers
  const allSuppliers = await db.select().from(suppliers).orderBy(desc(suppliers.createdAt));

  // Get product counts per supplier
  const productCounts = await db
    .select({
      supplierId: productSupplierLinks.supplierId,
      count: count(),
    })
    .from(productSupplierLinks)
    .groupBy(productSupplierLinks.supplierId);

  const productCountMap = new Map(productCounts.map((pc) => [pc.supplierId, pc.count]));

  // Get last sync timestamp per supplier
  const lastSyncs = await db
    .select({
      supplierId: syncJobs.supplierId,
      lastSync: sql<string>`MAX(${syncJobs.completedAt})`.as('last_sync'),
    })
    .from(syncJobs)
    .where(eq(syncJobs.status, 'completed'))
    .groupBy(syncJobs.supplierId);

  const lastSyncMap = new Map(lastSyncs.map((ls) => [ls.supplierId, ls.lastSync]));

  // Get fulfillment rates per supplier (delivered / total non-pending)
  const supplierIds = allSuppliers.map((s) => s.id);
  let fulfillmentMap = new Map<string, number>();

  if (supplierIds.length > 0) {
    const fulfillmentStats = await db
      .select({
        supplierId: subOrders.supplierId,
        total: count(),
        delivered: sql<number>`COUNT(CASE WHEN ${subOrders.status} = 'delivered' THEN 1 END)`.as('delivered'),
      })
      .from(subOrders)
      .where(
        and(
          inArray(subOrders.supplierId, supplierIds),
          sql`${subOrders.status} NOT IN ('pending')`
        )
      )
      .groupBy(subOrders.supplierId);

    fulfillmentMap = new Map(
      fulfillmentStats.map((fs) => [
        fs.supplierId,
        fs.total > 0 ? (fs.delivered / fs.total) * 100 : 100,
      ])
    );
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'error':
      case 'credential_error':
        return 'bg-red-100 text-red-800';
      case 'unavailable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Supplier Management</h1>
              <p className="mt-2 text-gray-600">
                Manage your supplier connections ({allSuppliers.length} suppliers)
              </p>
            </div>
            <Link
              href="/admin/suppliers/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F52BA]"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Supplier
            </Link>
          </div>
        </div>

        {/* Suppliers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Sync
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <p className="mt-2 text-sm">No suppliers registered yet</p>
                        <Link
                          href="/admin/suppliers/new"
                          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-900"
                        >
                          Register your first supplier
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  allSuppliers.map((supplier) => {
                    const productCount = productCountMap.get(supplier.id) ?? 0;
                    const lastSync = lastSyncMap.get(supplier.id);
                    const fulfillmentRate = fulfillmentMap.get(supplier.id);
                    const lowFulfillment = fulfillmentRate !== undefined && fulfillmentRate < 90;

                    return (
                      <tr key={supplier.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {supplier.name}
                              </div>
                              {supplier.displayLabel && (
                                <div className="text-sm text-gray-500">{supplier.displayLabel}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {supplier.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(supplier.status)}`}
                            >
                              {supplier.status}
                            </span>
                            {supplier.status === 'unavailable' && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                unavailable
                              </span>
                            )}
                            {lowFulfillment && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Low fulfillment ({fulfillmentRate.toFixed(0)}%)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {productCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {lastSync
                            ? new Date(lastSync).toLocaleString()
                            : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/admin/suppliers/${supplier.id}`}
                            className="text-black hover:text-blue-900"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
