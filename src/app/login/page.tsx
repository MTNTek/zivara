'use client';

import { useState, useTransition, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { loginSchema } from '@/features/auth/schemas';
import { validateWithSchema } from '@/lib/form-validation';
import { ButtonSpinner } from '@/components/ui/spinner';
import { toast } from '@/lib/toast';
import { Logo } from '@/components/ui/logo';
import { hasAnyUsers } from '@/features/auth/actions';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [isPending, startTransition] = useTransition();
  const [isCheckingUsers, setIsCheckingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  // Check if any users exist on mount
  useEffect(() => {
    async function checkUsers() {
      try {
        const usersExist = await hasAnyUsers();
        if (!usersExist) {
          toast.info('Welcome!', 'Create the first admin account to get started');
          router.push('/register');
        }
      } catch (error) {
        console.error('Error checking users:', error);
      } finally {
        setIsCheckingUsers(false);
      }
    }
    checkUsers();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Validate with Zod schema
    const validation = validateWithSchema(loginSchema, formData);
    if (!validation.success) {
      setError(validation.error || 'Please check your input');
      setFieldErrors(validation.fieldErrors || {});
      return;
    }

    startTransition(async () => {
      const { error } = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        const errorMsg = 'Invalid email or password. Please try again';
        setError(errorMsg);
        toast.error('Sign in failed', errorMsg);
      } else {
        toast.success('Welcome back!', 'Signing you in...');
        router.push(redirect);
        router.refresh();
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

  // Show loading state while checking for users
  if (isCheckingUsers) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <ButtonSpinner />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block" aria-label="Zivara home">
            <Logo variant="dark" size="lg" />
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            Sign in
          </h1>
        </div>

        <div className="bg-white rounded-lg border border-gray-300 p-8">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
                  aria-required="true"
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                  autoComplete="current-password"
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
              {fieldErrors.password && (
                <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert" aria-live="assertive">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-4 h-4 accent-blue-800 focus:ring-[#0F52BA] focus:ring-2 focus:ring-offset-2 border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                  Remember me
                </label>
              </div>
              <Link href="/reset-password" className="text-sm text-black hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-[#0F52BA] focus:ring-offset-2 rounded">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-800 text-white px-6 py-3 min-h-[44px] rounded-lg font-semibold hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#0F52BA] focus:ring-offset-2"
              aria-label={isPending ? 'Signing in' : 'Sign in'}
            >
              {isPending && <ButtonSpinner />}
              {isPending ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              New to Zivara?{' '}
              <Link href="/register" className="text-[#2563eb] hover:text-[#1d4ed8] hover:underline font-medium">
                Create your account
              </Link>
            </p>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secure login</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>256-bit encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <ButtonSpinner />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
