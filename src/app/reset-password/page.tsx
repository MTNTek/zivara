'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { requestPasswordReset } from '@/features/auth/actions';
import { passwordResetRequestSchema } from '@/features/auth/schemas';
import { validateWithSchema } from '@/lib/form-validation';
import { ButtonSpinner } from '@/components/ui/spinner';

export default function ResetPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldError(null);
    setSuccess(false);

    // Validate with Zod schema
    const validation = validateWithSchema(passwordResetRequestSchema, { email });
    if (!validation.success) {
      setError(validation.error || 'Please enter a valid email');
      setFieldError(validation.fieldErrors?.email || null);
      return;
    }

    startTransition(async () => {
      const result = await requestPasswordReset({ email });

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Failed to send reset email');
      }
    });
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (fieldError) {
      setFieldError(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-teal-600">
            Zivara
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-gray-600">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          {success ? (
            <div className="text-center">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                Password reset link sent! Check your email for instructions.
              </div>
              <Link
                href="/login"
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    fieldError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {fieldError && (
                  <p className="mt-1 text-sm text-red-600">{fieldError}</p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isPending && <ButtonSpinner />}
                {isPending ? 'Sending...' : 'Send Reset Link'}
              </button>

              <div className="text-center">
                <Link href="/login" className="text-sm text-teal-600 hover:text-teal-700">
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
