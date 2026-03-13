'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSignOut = () => {
    startTransition(async () => {
      await authClient.signOut();
      router.push('/');
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isPending}
      className="block w-full text-left text-red-600 hover:text-red-700 disabled:opacity-50"
    >
      {isPending ? 'Signing out...' : 'Sign Out'}
    </button>
  );
}
