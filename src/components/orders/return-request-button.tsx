'use client';

import { useState } from 'react';
import { requestReturn } from '@/features/orders/return-actions';
import { toast } from '@/lib/toast';
import { useRouter } from 'next/navigation';

export function ReturnRequestButton({ orderId, orderStatus, updatedAt }: {
  orderId: string;
  orderStatus: string;
  updatedAt: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (orderStatus !== 'delivered') return null;

  const daysSinceDelivery = (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceDelivery > 30) return null;

  const daysLeft = Math.ceil(30 - daysSinceDelivery);

  const handleSubmit = async () => {
    if (!reason.trim()) { toast.error('Error', 'Please provide a reason'); return; }
    setLoading(true);
    const result = await requestReturn(orderId, reason);
    setLoading(false);
    if (result.success) {
      toast.success('Return Requested', 'We\'ll review your request shortly.');
      setOpen(false);
      router.refresh();
    } else {
      toast.error('Error', result.error || 'Failed to submit return');
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-[#2563eb] hover:text-[#1d4ed8] hover:underline"
      >
        Request Return
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Request a Return</h3>
            <p className="text-xs text-gray-500 mb-4">{daysLeft} day{daysLeft !== 1 ? 's' : ''} left in return window</p>

            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for return</label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#0F52BA]"
            >
              <option value="">Select a reason...</option>
              <option value="Defective or damaged">Defective or damaged</option>
              <option value="Wrong item received">Wrong item received</option>
              <option value="Item not as described">Item not as described</option>
              <option value="Changed my mind">Changed my mind</option>
              <option value="Better price found elsewhere">Better price found elsewhere</option>
              <option value="Other">Other</option>
            </select>

            <div className="flex gap-3 justify-end">
              <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !reason}
                className="px-4 py-2 text-sm font-medium text-white bg-[#0F52BA] rounded-lg hover:bg-[#0D47A1] disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
