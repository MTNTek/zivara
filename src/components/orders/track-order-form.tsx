'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ButtonSpinner } from '@/components/ui/spinner';

export function TrackOrderForm() {
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = orderNumber.trim();
    if (!trimmed) {
      setError('Please enter an order number.');
      return;
    }

    setIsLoading(true);
    router.push(`/track/${encodeURIComponent(trimmed)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-1.5">
          Order Number
        </label>
        <input
          type="text"
          id="orderNumber"
          value={orderNumber}
          onChange={(e) => {
            setOrderNumber(e.target.value);
            if (error) setError(null);
          }}
          placeholder="e.g. ZIV-20260317-ABC123"
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-base ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#fbbf24] text-[#0F1111] px-6 py-3 rounded-full font-semibold hover:bg-[#f59e0b] transition-colors disabled:opacity-50 flex items-center justify-center border border-[#FCD200]"
      >
        {isLoading && <ButtonSpinner />}
        {isLoading ? 'Looking up...' : 'Track Order'}
      </button>
    </form>
  );
}
