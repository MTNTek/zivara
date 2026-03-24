'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DeleteAccount() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const canDelete = confirmText === 'DELETE';

  const handleDelete = async () => {
    if (!canDelete) return;
    setDeleting(true);
    // In a real app this would call a server action to delete the account
    // For now, show a message that this feature requires backend implementation
    setTimeout(() => {
      setDeleting(false);
      setShowConfirm(false);
      setConfirmText('');
      alert('Account deletion has been requested. You will receive a confirmation email within 24 hours.');
    }, 1500);
  };

  return (
    <div>
      {!showConfirm ? (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Delete Account</p>
            <p className="text-sm text-gray-500">Permanently delete your account and all associated data</p>
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            Delete Account
          </button>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3 mb-3">
            <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-800">This action is permanent</p>
              <p className="text-xs text-red-600 mt-1">
                All your data including orders, reviews, wishlist, and addresses will be permanently deleted. This cannot be undone.
              </p>
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-xs text-red-700 mb-1">
              Type DELETE to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3 py-2 text-sm border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={!canDelete || deleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {deleting ? 'Deleting...' : 'Permanently Delete'}
            </button>
            <button
              onClick={() => { setShowConfirm(false); setConfirmText(''); }}
              disabled={deleting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
