import { db } from '@/db';
import { suppliers, supplierCredentials, syncJobs, productSupplierLinks } from '@/db/schema';
import { eq, desc, count } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { maskCredential } from '@/features/suppliers/credentials';
import { SupplierActions } from './supplier-actions';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SupplierDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  // Fetch supplier
  const [supplier] = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.id, id))
    .limit(1);

  if (!supplier) {
    notFound();
  }

  // Fetch credentials (masked)
  const creds = await db
    .select()
    .from(supplierCredentials)
    .where(eq(supplierCredentials.supplierId, id));

  const maskedCreds = creds.map((c) => ({
    id: c.id,
    credentialType: c.credentialType,
    maskedValue: maskCredential(c.encryptedValue),
    updatedAt: c.updatedAt,
  }));

  // Fetch recent sync jobs (last 10)
  const recentSyncJobs = await db
    .select()
    .from(syncJobs)
    .where(eq(syncJobs.supplierId, id))
    .orderBy(desc(syncJobs.createdAt))
    .limit(10);

  // Fetch product count
  const [productCountResult] = await db
    .select({ count: count() })
    .from(productSupplierLinks)
    .where(eq(productSupplierLinks.supplierId, id));

  const productCount = productCountResult?.count ?? 0;

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

  function getSyncStatusBadge(status: string) {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
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
              <h1 className="text-3xl font-bold text-gray-900">{supplier.name}</h1>
              <p className="mt-2 text-gray-600">
                {supplier.displayLabel || supplier.name} &middot; {supplier.type}
              </p>
            </div>
            <Link
              href="/admin/suppliers"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Suppliers
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Supplier Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Supplier Information</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{supplier.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">{supplier.type}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Display Label</dt>
                  <dd className="mt-1 text-sm text-gray-900">{supplier.displayLabel || '—'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Base URL</dt>
                  <dd className="mt-1 text-sm text-gray-900 break-all">{supplier.baseUrl || '—'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Currency</dt>
                  <dd className="mt-1 text-sm text-gray-900">{supplier.currency}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(supplier.status)}`}>
                      {supplier.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Health Check</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {supplier.lastHealthCheck
                      ? new Date(supplier.lastHealthCheck).toLocaleString()
                      : 'Never'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Products</dt>
                  <dd className="mt-1 text-sm text-gray-900">{productCount}</dd>
                </div>
              </dl>
              {supplier.lastError && (
                <div className="mt-4 p-3 bg-red-50 rounded-md">
                  <p className="text-sm text-red-700">Last error: {supplier.lastError}</p>
                </div>
              )}
            </div>

            {/* Credentials */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Credentials</h2>
              {maskedCreds.length === 0 ? (
                <p className="text-sm text-gray-500">No credentials configured</p>
              ) : (
                <div className="space-y-3">
                  {maskedCreds.map((cred) => (
                    <div key={cred.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <span className="text-sm font-medium text-gray-900">{cred.credentialType}</span>
                        <span className="ml-3 text-sm text-gray-500 font-mono">{cred.maskedValue}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        Updated {cred.updatedAt ? new Date(cred.updatedAt).toLocaleDateString() : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Sync Jobs */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Sync Jobs</h2>
              {recentSyncJobs.length === 0 ? (
                <p className="text-sm text-gray-500">No sync jobs yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Errors</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Started</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentSyncJobs.map((job) => {
                        const duration =
                          job.startedAt && job.completedAt
                            ? Math.round(
                                (new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime()) / 1000
                              )
                            : null;

                        return (
                          <tr key={job.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900">{job.jobType}</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSyncStatusBadge(job.status)}`}>
                                {job.status}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {duration !== null ? `${duration}s` : '—'}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {job.errorCount ?? 0}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {job.startedAt
                                ? new Date(job.startedAt).toLocaleString()
                                : job.createdAt
                                  ? new Date(job.createdAt).toLocaleString()
                                  : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Actions */}
          <div className="space-y-8">
            <SupplierActions supplierId={supplier.id} status={supplier.status} />
          </div>
        </div>
      </div>
    </div>
  );
}
