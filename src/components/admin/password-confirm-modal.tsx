'use client';

import { useState, useRef, useEffect } from 'react';

interface PasswordConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: (password: string) => Promise<void>;
  onCancel: () => void;
}

export function PasswordConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: PasswordConfirmModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setPassword('');
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Password is required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onConfirm(password);
    } catch (err: any) {
      setError(err.message || 'Incorrect password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{message}</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-1">
            Admin Password
          </label>
          <input
            ref={inputRef}
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 mb-3"
            placeholder="Enter your password"
            autoComplete="current-password"
          />

          {error && (
            <p className="text-sm text-red-600 mb-3">{error}</p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
