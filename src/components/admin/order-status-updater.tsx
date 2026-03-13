'use client';

import { useState } from 'react';
import { updateOrderStatus } from '@/features/orders/actions';
import { useRouter } from 'next/navigation';
import { ButtonSpinner } from '@/components/ui/spinner';
import { toast } from '@/lib/toast';

interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: string;
}

/**
 * Order status update dropdown for admin
 * Validates: Requirements 21.4, 21.5
 */
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export function OrderStatusUpdater({ orderId, currentStatus }: OrderStatusUpdaterProps) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(currentStatus as OrderStatus);
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpdateStatus = async () => {
    if (status === currentStatus) {
      setError('Please select a different status');
      return;
    }

    setIsUpdating(true);
    setError(null);
    setSuccess(false);

    const result = await updateOrderStatus({
      orderId,
      status,
      notes: notes || undefined,
    });

    setIsUpdating(false);

    if (result.success) {
      setSuccess(true);
      setNotes('');
      toast.success('Order status updated', `Status changed to ${status}`);
      // Refresh the page to show updated data
      router.refresh();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } else {
      const errorMsg = typeof result.error === 'string' ? result.error : ((result.error as unknown as Record<string, string>)?.message || 'Failed to update order status');
      setError(errorMsg);
      toast.error('Could not update status', errorMsg);
    }
  };

  const getValidStatuses = () => {
    const validTransitions: Record<string, string[]> = {
      'pending': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered'],
      'delivered': [],
      'cancelled': [],
    };

    return validTransitions[currentStatus] || [];
  };

  const validStatuses = getValidStatuses();
  const canUpdate = validStatuses.length > 0;

  const getStatusBadgeClass = (statusValue: string) => {
    switch (statusValue) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Update Order Status</h2>
      </div>
      <div className="p-6">
        {/* Current Status */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-500 mb-2">Current Status</p>
          <span
            className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusBadgeClass(
              currentStatus
            )}`}
          >
            {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
          </span>
        </div>

        {canUpdate ? (
          <>
            {/* Status Dropdown */}
            <div className="mb-4">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                New Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value={currentStatus}>Select new status...</option>
                {validStatuses.map((validStatus) => (
                  <option key={validStatus} value={validStatus}>
                    {validStatus.charAt(0).toUpperCase() + validStatus.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Add any notes about this status change..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">Order status updated successfully!</p>
              </div>
            )}

            {/* Update Button */}
            <button
              onClick={handleUpdateStatus}
              disabled={isUpdating || status === currentStatus}
              className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isUpdating && <ButtonSpinner />}
              {isUpdating ? 'Updating...' : 'Update Status'}
            </button>
          </>
        ) : (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600">
              This order cannot be updated. Orders with status &quot;{currentStatus}&quot; are final.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
