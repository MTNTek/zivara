'use client';

import { useState } from 'react';
import { approveReturn, rejectReturn, issueRefund } from '@/features/orders/return-actions';
import { useRouter } from 'next/navigation';

export function AdminReturnActions({ orderId, orderStatus, orderTotal }: {
  orderId: string;
  orderStatus: string;
  orderTotal: string;
}) {
  const [loading, setLoading] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [showRefund, setShowRefund] = useState(false);
  const [refundAmount, setRefundAmount] = useState(orderTotal);
  const router = useRouter();

  const handle = async (action: string, fn: () => Promise<{ success: boolean; error?: string }>) => {
    setLoading(action);
    const result = await fn();
    setLoading('');
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || 'Action failed');
    }
  };

  if (orderStatus === 'return_requested') {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4">
        <p className="text-sm font-medium text-orange-800 mb-3">⚠️ Return requested by customer</p>
        <div className="flex gap-2">
          <button
            onClick={() => handle('approve', () => approveReturn(orderId))}
            disabled={!!loading}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading === 'approve' ? 'Processing...' : 'Approve & Refund'}
          </button>
          <button
            onClick={() => setShowReject(true)}
            disabled={!!loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            Reject
          </button>
        </div>
        {showReject && (
          <div className="mt-3">
            <input
              type="text"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md mb-2"
            />
            <button
              onClick={() => handle('reject', () => rejectReturn(orderId, rejectReason))}
              disabled={!rejectReason || !!loading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading === 'reject' ? 'Rejecting...' : 'Confirm Reject'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Show refund button for delivered/processing orders
  if (['delivered', 'processing', 'shipped'].includes(orderStatus)) {
    return (
      <div className="mt-4">
        {!showRefund ? (
          <button
            onClick={() => setShowRefund(true)}
            className="text-sm text-[#2563eb] hover:underline"
          >
            Issue Refund
          </button>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Refund Amount ($)</label>
            <input
              type="number"
              value={refundAmount}
              onChange={e => setRefundAmount(e.target.value)}
              step="0.01"
              min="0.01"
              max={orderTotal}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md mb-2"
            />
            <div className="flex gap-2">
              <button
                onClick={() => handle('refund', () => issueRefund(orderId, Number(refundAmount)))}
                disabled={!!loading}
                className="px-4 py-2 text-sm font-medium text-white bg-[#0F52BA] rounded-lg hover:bg-[#0D47A1] disabled:opacity-50"
              >
                {loading === 'refund' ? 'Processing...' : 'Issue Refund'}
              </button>
              <button onClick={() => setShowRefund(false)} className="px-4 py-2 text-sm text-gray-600">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
