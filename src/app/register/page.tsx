'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/features/auth/actions';
import { registerSchema } from '@/features/auth/schemas';
import { validateWithSchema } from '@/lib/form-validation';
import { ButtonSpinner } from '@/components/ui/spinner';
import { toast } from '@/lib/toast';

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setFieldErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    // Validate with Zod schema
    const validation = validateWithSchema(registerSchema, {
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });
    
    if (!validation.success) {
      setError(validation.error || 'Please check your input');
      setFieldErrors(validation.fieldErrors || {});
      return;
    }

    startTransition(async () => {
      const result = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        toast.success('Account created!', 'Please sign in to continue');
        router.push('/login?registered=true');
      } else {
        const errorMsg = result.error?.message || result.error || 'Failed to create account';
        setError(errorMsg);
        toast.error('Registration failed', errorMsg);
      }
    });
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-teal-600" aria-label="Zivara home">
            Zivara
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Create your account
          </h1>
          <p className="mt-2 text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-teal-600 hover:text-teal-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className={`w-full px-4 py-2 min-h-[44px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                  fieldErrors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                aria-required="true"
                aria-invalid={!!fieldErrors.name}
                aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                autoComplete="name"
              />
              {fieldErrors.name && (
                <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                className={`w-full px-4 py-2 min-h-[44px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                  fieldErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                aria-required="true"
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                autoComplete="email"
              />
              {fieldErrors.email && (
                <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                className={`w-full px-4 py-2 min-h-[44px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                  fieldErrors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                minLength={8}
                aria-required="true"
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? 'password-error password-hint' : 'password-hint'}
                autoComplete="new-password"
              />
              <p id="password-hint" className="mt-1 text-xs text-gray-600">
                Must be at least 8 characters
              </p>
              {fieldErrors.password && (
                <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                className={`w-full px-4 py-2 min-h-[44px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                  fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                minLength={8}
                aria-required="true"
                aria-invalid={!!fieldErrors.confirmPassword}
                aria-describedby={fieldErrors.confirmPassword ? 'confirm-password-error' : undefined}
                autoComplete="new-password"
              />
              {fieldErrors.confirmPassword && (
                <p id="confirm-password-error" className="mt-1 text-sm text-red-600" role="alert">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert" aria-live="assertive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-teal-600 text-white px-6 py-3 min-h-[44px] rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              aria-label={isPending ? 'Creating account' : 'Create account'}
            >
              {isPending && <ButtonSpinner />}
              {isPending ? 'Creating account...' : 'Create Account'}
            </button>

            <p className="text-xs text-gray-600 text-center">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
