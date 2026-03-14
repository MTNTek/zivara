'use client';

import { useState, useTransition, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { loginSchema } from '@/features/auth/schemas';
import { validateWithSchema } from '@/lib/form-validation';
import { ButtonSpinner } from '@/components/ui/spinner';
import { toast } from '@/lib/toast';
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
          <Link href="/" className="text-3xl font-bold text-black" aria-label="Zivara home">
            Zivara
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Sign in to your account
          </h1>
          <p className="mt-2 text-gray-600">
            Or{' '}
            <Link href="/register" className="text-black hover:text-blue-800 font-medium">
              create a new account
            </Link>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
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
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                className={`w-full px-4 py-2 min-h-[44px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F52BA] focus:ring-offset-2 ${
                  fieldErrors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                aria-required="true"
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                autoComplete="current-password"
              />
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
