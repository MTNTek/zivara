'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupplier } from '@/features/suppliers/actions';
import type { SupplierType } from '@/features/suppliers/adapters/types';

const SUPPLIER_TYPES: { value: SupplierType; label: string }[] = [
  { value: 'amazon', label: 'Amazon' },
  { value: 'noon', label: 'Noon' },
  { value: 'trendyol', label: 'Trendyol' },
  { value: 'aliexpress', label: 'AliExpress' },
  { value: 'cj_dropshipping', label: 'CJ Dropshipping' },
  { value: 'custom', label: 'Custom' },
];

const CURRENCIES = ['USD', 'EUR', 'TRY', 'AED', 'CNY'];

export default function NewSupplierPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<SupplierType>('custom');
  const [baseUrl, setBaseUrl] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [displayLabel, setDisplayLabel] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await createSupplier({
        name: name.trim(),
        type,
        baseUrl: baseUrl.trim() || undefined,
        currency,
        displayLabel: displayLabel.trim() || undefined,
      });

      if (result.success) {
        router.push('/admin/suppliers');
      } else {
        setError(result.error || 'Failed to create supplier');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Register New Supplier</h1>
              <p className="mt-2 text-gray-600">Add a new supplier connection to the platform</p>
            </div>
            <Link
              href="/admin/suppliers"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Supplier Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Amazon US"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Must be unique across all suppliers</p>
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Supplier Type <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as SupplierType)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              {SUPPLIER_TYPES.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="baseUrl" className="block text-sm font-medium text-gray-700">
              Base URL
            </label>
            <input
              id="baseUrl"
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.supplier.com"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">The API endpoint for this supplier</p>
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
              Currency <span className="text-red-500">*</span>
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="displayLabel" className="block text-sm font-medium text-gray-700">
              Display Label
            </label>
            <input
              id="displayLabel"
              type="text"
              value={displayLabel}
              onChange={(e) => setDisplayLabel(e.target.value)}
              placeholder="e.g., Fulfilled by Amazon"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Customer-facing label shown on product pages</p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-800 rounded-md hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F52BA] disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating Supplier...' : 'Create Supplier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
