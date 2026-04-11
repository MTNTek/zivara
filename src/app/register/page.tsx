'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { registerSchema } from '@/features/auth/schemas';
import { validateWithSchema } from '@/lib/form-validation';
import { ButtonSpinner } from '@/components/ui/spinner';
import { toast } from '@/lib/toast';
import { hasAnyUsers, promoteToAdmin } from '@/features/auth/actions';
import { PasswordStrength } from '@/components/auth/password-strength';
import { Logo } from '@/components/ui/logo';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    email: searchParams.get('email') || '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      try {
        // Check if this is the first user before signing up
        let isFirstUser = false;
        try {
          isFirstUser = !(await hasAnyUsers());
        } catch (e) {
          // If hasAnyUsers fails, continue with registration anyway
          console.error('Failed to check existing users:', e);
        }

        const { data, error } = await authClient.signUp.email({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        });

        if (error) {
          const errorMsg = error.message || 'Failed to create account';
          setError(errorMsg);
          toast.error('Registration failed', errorMsg);
          return;
        }

        // If first user, promote to admin
        if (isFirstUser && data?.user?.id) {
          try {
            await promoteToAdmin(data.user.id);
            toast.success('Admin account created!', 'You are the first user and have been granted admin privileges');
          } catch (e) {
            console.error('Failed to promote to admin:', e);
            toast.success('Account created!', 'You are now signed in');
          }
        } else {
          toast.success('Account created!', 'You are now signed in');
        }

        router.push('/');
        router.refresh();
      } catch (e) {
        console.error('Registration error:', e);
        setError('An unexpected error occurred. Please try again.');
        toast.error('Registration failed', 'An unexpected error occurred');
      }
    });
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block" aria-label="Zivara home">
            <Logo variant="dark" size="lg" />
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Create your account
          </h1>
          <p className="mt-2 text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-black hover:text-blue-800 font-medium">
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
                className={`w-full px-4 py-2 min-h-[44px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F52BA] focus:ring-offset-2 ${
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
                className={`w-full px-4 py-2 min-h-[44px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F52BA] focus:ring-offset-2 ${
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
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  className={`w-full px-4 py-2 pr-12 min-h-[44px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F52BA] focus:ring-offset-2 ${
                    fieldErrors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                  minLength={8}
                  aria-required="true"
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? 'password-error password-hint' : 'password-hint'}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              <p id="password-hint" className="mt-1 text-xs text-gray-600">
                Must be at least 8 characters
              </p>
              <PasswordStrength password={formData.password} />
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
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                  className={`w-full px-4 py-2 pr-12 min-h-[44px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F52BA] focus:ring-offset-2 ${
                    fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                  minLength={8}
                  aria-required="true"
                  aria-invalid={!!fieldErrors.confirmPassword}
                  aria-describedby={fieldErrors.confirmPassword ? 'confirm-password-error' : undefined}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
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
              className="w-full bg-blue-800 text-white px-6 py-3 min-h-[44px] rounded-lg font-semibold hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#0F52BA] focus:ring-offset-2"
              aria-label={isPending ? 'Creating account' : 'Create account'}
            >
              {isPending && <ButtonSpinner />}
              {isPending ? 'Creating account...' : 'Create Account'}
            </button>

            <p className="text-xs text-gray-600 text-center">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-black hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-black hover:underline">Privacy Policy</Link>
            </p>
          </form>

          {/* Benefits */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3">Why create an account?</p>
            <div className="space-y-2">
              {[
                { icon: '🚚', text: 'Track orders and get delivery updates' },
                { icon: '❤️', text: 'Save items to your wishlist' },
                { icon: '⭐', text: 'Write reviews and earn rewards' },
              ].map((benefit) => (
                <div key={benefit.text} className="flex items-center gap-2 text-xs text-gray-600">
                  <span>{benefit.icon}</span>
                  <span>{benefit.text}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Already have an account?{' '}
              <a href="/login" className="text-[#2563eb] hover:text-[#1d4ed8] hover:underline font-medium">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
