'use client';

import { useEffect, useState, useTransition } from 'react';
import { triggerSync } from '@/features/suppliers/actions';

interface SyncJob {
  id: string;
  supplierId: string;
  supplierName: string;
  jobType: string;
  status: string;
  productsChecked: number | null;
  productsUpdated: number | null;
  errorCount: number | null;
  resultSummary: string | null;
  retryCount: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

async function fetchSyncJobs(): Promise<SyncJob[]> {
  const res = await fetch('/api/admin/sync-jobs', { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default function SyncJobsPage() {
  const [jobs, setJobs] = useState<SyncJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [triggerError, setTriggerError] = useState<string | null>(null);

  useEffect(() => {
    fetchSyncJobs().then((data) => {
      setJobs(data);
      setLoading(false);
    });
  }, []);

  const refresh = async () => {
    const data = await fetchSyncJobs();
    setJobs(data);
  };

  const handleTriggerSync = (supplierId: string, supplierName: string, jobType: 'inventory' | 'price') => {
    setTriggerError(null);
    startTransition(async () => {
      const result = await triggerSync(supplierId, jobType);
      if (!result.success) {
        setTriggerError(`Failed to trigger ${jobType} sync for ${supplierName}: ${result.error}`);
      }
      await refresh();
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Completed</span>;
      case 'running':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Running</span>;
      case 'failed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Failed</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const getDuration = (startedAt: string | null, completedAt: string | null) => {
    if (!startedAt) return '—';
    const start = new Date(startedAt).getTime();
    const end = completedAt ? new Date(completedAt).getTime() : Date.now();
    const seconds = Math.round((end - start) / 1000);
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const failedJobs = jobs.filter((j) => j.status === 'failed' && j.retryCount >= 3);

  // Get unique suppliers for manual trigger
  const uniqueSuppliers = Array.from(
    new Map(jobs.map((j) => [j.supplierId, { id: j.supplierId, name: j.supplierName }])).values()
  );

  return (
    <div className="max-w-[1500px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sync Jobs</h1>
        <button
          onClick={() => refresh()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {/* Failed jobs alert */}
      {failedJobs.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="font-semibold text-red-800">{failedJobs.length} job(s) failed after all retries</span>
          </div>
          <ul className="text-sm text-red-700 ml-7 list-disc">
            {failedJobs.map((j) => (
              <li key={j.id}>{j.supplierName} — {j.jobType} sync ({j.resultSummary || 'No details'})</li>
            ))}
          </ul>
        </div>
      )}

      {triggerError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {triggerError}
        </div>
      )}

      {/* Manual trigger section */}
      {uniqueSuppliers.length > 0 && (
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Trigger Manual Sync</h2>
          <div className="flex flex-wrap gap-2">
            {uniqueSuppliers.map((s) => (
              <div key={s.id} className="flex items-center gap-1">
                <span className="text-sm text-gray-700 mr-1">{s.name}:</span>
                <button
                  disabled={isPending}
                  onClick={() => handleTriggerSync(s.id, s.name, 'inventory')}
                  className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 disabled:opacity-50"
                >
                  Inventory
                </button>
                <button
                  disabled={isPending}
                  onClick={() => handleTriggerSync(s.id, s.name, 'price')}
                  className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 disabled:opacity-50"
                >
                  Price
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Jobs table */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">Loading sync jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">No sync jobs found.</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Checked</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Errors</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Retries</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {jobs.map((job) => (
                <tr key={job.id} className={job.status === 'failed' ? 'bg-red-50' : ''}>
                  <td className="px-4 py-3 text-sm text-gray-900">{job.supplierName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{job.jobType}</td>
                  <td className="px-4 py-3">{getStatusBadge(job.status)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{getDuration(job.startedAt, job.completedAt)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{job.productsChecked ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{job.productsUpdated ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {job.errorCount != null && job.errorCount > 0 ? (
                      <span className="text-red-600 font-medium">{job.errorCount}</span>
                    ) : (
                      job.errorCount ?? '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{job.retryCount}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(job.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
