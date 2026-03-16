'use client';

import { useState } from 'react';
import {
  activateSupplier,
  deactivateSupplier,
  triggerHealthCheck,
  triggerSync,
  saveCredential,
} from '@/features/suppliers/actions';

interface SupplierActionsProps {
  supplierId: string;
  status: string;
}

export function SupplierActions({ supplierId, status }: SupplierActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCredForm, setShowCredForm] = useState(false);
  const [credType, setCredType] = useState('api_key');
  const [credValue, setCredValue] = useState('');

  async function handleAction(action: string) {
    setLoading(action);
    setMessage(null);
    try {
      switch (action) {
        case 'activate': {
          const result = await activateSupplier(supplierId);
          setMessage(
            result.success
              ? { type: 'success', text: 'Supplier activated' }
              : { type: 'error', text: result.error || 'Activation failed' }
          );
          break;
        }
        case 'deactivate': {
          const result = await deactivateSupplier(supplierId);
          setMessage(
            result.success
              ? { type: 'success', text: 'Supplier deactivated' }
              : { type: 'error', text: result.error || 'Deactivation failed' }
          );
          break;
        }
        case 'health-check': {
          const result = await triggerHealthCheck(supplierId);
          setMessage(
            result.healthy
              ? { type: 'success', text: 'Health check passed' }
              : { type: 'error', text: result.error || 'Health check failed' }
          );
          break;
        }
        case 'sync-inventory': {
          const result = await triggerSync(supplierId, 'inventory');
          setMessage(
            result.success
              ? { type: 'success', text: `Inventory sync scheduled (Job: ${result.jobId?.slice(0, 8)}...)` }
              : { type: 'error', text: result.error || 'Failed to schedule sync' }
          );
          break;
        }
        case 'sync-price': {
          const result = await triggerSync(supplierId, 'price');
          setMessage(
            result.success
              ? { type: 'success', text: `Price sync scheduled (Job: ${result.jobId?.slice(0, 8)}...)` }
              : { type: 'error', text: result.error || 'Failed to schedule sync' }
          );
          break;
        }
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(null);
    }
  }

  async function handleSaveCredential(e: React.FormEvent) {
    e.preventDefault();
    if (!credValue.trim()) return;

    setLoading('save-cred');
    setMessage(null);
    try {
      const result = await saveCredential(supplierId, credType, credValue);
      if (result.success) {
        setMessage({ type: 'success', text: 'Credential saved' });
        setCredValue('');
        setShowCredForm(false);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save credential' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Status Message */}
      {message && (
        <div
          className={`p-3 rounded-md text-sm ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Actions Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
        <div className="space-y-3">
          {status === 'active' ? (
            <button
              onClick={() => handleAction('deactivate')}
              disabled={loading !== null}
              className="w-full px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-50 transition-colors"
            >
              {loading === 'deactivate' ? 'Deactivating...' : 'Deactivate Supplier'}
            </button>
          ) : (
            <button
              onClick={() => handleAction('activate')}
              disabled={loading !== null}
              className="w-full px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100 disabled:opacity-50 transition-colors"
            >
              {loading === 'activate' ? 'Activating...' : 'Activate Supplier'}
            </button>
          )}

          <button
            onClick={() => handleAction('health-check')}
            disabled={loading !== null}
            className="w-full px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50 transition-colors"
          >
            {loading === 'health-check' ? 'Checking...' : 'Trigger Health Check'}
          </button>

          <button
            onClick={() => handleAction('sync-inventory')}
            disabled={loading !== null}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            {loading === 'sync-inventory' ? 'Scheduling...' : 'Trigger Inventory Sync'}
          </button>

          <button
            onClick={() => handleAction('sync-price')}
            disabled={loading !== null}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            {loading === 'sync-price' ? 'Scheduling...' : 'Trigger Price Sync'}
          </button>
        </div>
      </div>

      {/* Add Credential Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Credential</h2>
        {!showCredForm ? (
          <button
            onClick={() => setShowCredForm(true)}
            className="w-full px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
          >
            Add New Credential
          </button>
        ) : (
          <form onSubmit={handleSaveCredential} className="space-y-3">
            <div>
              <label htmlFor="credType" className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                id="credType"
                value={credType}
                onChange={(e) => setCredType(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="api_key">API Key</option>
                <option value="oauth_token">OAuth Token</option>
                <option value="affiliate_id">Affiliate ID</option>
              </select>
            </div>
            <div>
              <label htmlFor="credValue" className="block text-sm font-medium text-gray-700">
                Value
              </label>
              <input
                id="credValue"
                type="password"
                value={credValue}
                onChange={(e) => setCredValue(e.target.value)}
                placeholder="Enter credential value"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading === 'save-cred'}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-800 rounded-md hover:bg-blue-900 disabled:opacity-50 transition-colors"
              >
                {loading === 'save-cred' ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCredForm(false);
                  setCredValue('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
