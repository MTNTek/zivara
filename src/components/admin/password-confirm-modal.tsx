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
  const [showPassword, setShowPassword] = useState(false);
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Incorrect password');
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
          <div className="relative">
            <input
              ref={inputRef}
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F52BA] mb-3"
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[13px] text-gray-500 hover:text-gray-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
          </div>

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
              className="px-4 py-2 text-sm bg-blue-800 text-white rounded-md hover:bg-blue-900 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
