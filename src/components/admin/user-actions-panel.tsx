'use client';

import { useState, useTransition } from 'react';
import { deactivateUser, reactivateUser, generatePasswordResetToken } from '@/features/admin/user-actions';

interface UserActionsPanelProps {
  userId: string;
  isActive: boolean;
  userName: string;
}

export function UserActionsPanel({ userId, isActive, userName }: UserActionsPanelProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const handleDeactivate = () => {
    if (!confirm(`Are you sure you want to deactivate ${userName}'s account? They will not be able to log in.`)) {
      return;
    }

    startTransition(async () => {
      const result = await deactivateUser(userId);
      if (result.success) {
        setMessage({ type: 'success', text: 'User account deactivated successfully' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to deactivate user' });
      }
    });
  };

  const handleReactivate = () => {
    if (!confirm(`Are you sure you want to reactivate ${userName}'s account?`)) {
      return;
    }

    startTransition(async () => {
      const result = await reactivateUser(userId);
      if (result.success) {
        setMessage({ type: 'success', text: 'User account reactivated successfully' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to reactivate user' });
      }
    });
  };

  const handlePasswordReset = () => {
    if (!confirm(`Generate a password reset token for ${userName}?`)) {
      return;
    }

    startTransition(async () => {
      const result = await generatePasswordResetToken(userId);
      if (result.success && result.resetToken) {
        setResetToken(result.resetToken);
        setMessage({
          type: 'success',
          text: 'Password reset token generated successfully. Copy the token below.',
        });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to generate reset token' });
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h2>

      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {resetToken && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-900 mb-2">Password Reset Token:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-2 bg-white rounded border border-blue-200 text-sm break-all">
              {resetToken}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(resetToken);
                setMessage({ type: 'success', text: 'Token copied to clipboard' });
              }}
              className="px-3 py-2 bg-blue-800 text-white rounded hover:bg-blue-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F52BA] focus:ring-offset-2"
            >
              Copy
            </button>
          </div>
          <p className="text-xs text-blue-700 mt-2">
            This token expires in 1 hour. Send it to the user via secure channel.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {isActive ? (
          <button
            onClick={handleDeactivate}
            disabled={isPending}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? 'Processing...' : 'Deactivate Account'}
          </button>
        ) : (
          <button
            onClick={handleReactivate}
            disabled={isPending}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? 'Processing...' : 'Reactivate Account'}
          </button>
        )}

        <button
          onClick={handlePasswordReset}
          disabled={isPending}
          className="w-full px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'Processing...' : 'Generate Password Reset Token'}
        </button>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
        <p className="text-xs text-yellow-800">
          <strong>Note:</strong> All actions are logged for audit purposes. Deactivating an account
          prevents the user from logging in but preserves their data and order history.
        </p>
      </div>
    </div>
  );
}
