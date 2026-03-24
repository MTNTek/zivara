'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';

export function SignInCard() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (mounted && session?.user) {
    return (
      <div className="bg-white p-5">
        <h2 className="text-xl font-bold text-[#0f1111] mb-2">
          Welcome back, {session.user.name?.split(' ')[0] || 'there'}
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Pick up where you left off
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/orders"
            className="text-center py-2 px-3 border border-gray-300 rounded-lg text-sm text-[#0f1111] hover:bg-gray-50 transition-colors"
          >
            Your Orders
          </Link>
          <Link
            href="/wishlist"
            className="text-center py-2 px-3 border border-gray-300 rounded-lg text-sm text-[#0f1111] hover:bg-gray-50 transition-colors"
          >
            Your Wishlist
          </Link>
          <Link
            href="/deals"
            className="text-center py-2 px-3 border border-gray-300 rounded-lg text-sm text-[#0f1111] hover:bg-gray-50 transition-colors"
          >
            Today&apos;s Deals
          </Link>
          <Link
            href="/profile"
            className="text-center py-2 px-3 border border-gray-300 rounded-lg text-sm text-[#0f1111] hover:bg-gray-50 transition-colors"
          >
            Your Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-5">
      <h2 className="text-xl font-bold text-[#0f1111] mb-2">
        Sign in for the best experience
      </h2>
      <Link
        href="/login"
        className="block w-full text-center py-2 px-4 bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0f1111] text-sm font-medium rounded-lg border border-[#fcd200] transition-colors"
      >
        Sign in securely
      </Link>
      <p className="text-xs text-gray-500 mt-3 text-center">
        New customer?{' '}
        <Link href="/register" className="text-[#2563eb] hover:text-[#1d4ed8] hover:underline">
          Start here
        </Link>
      </p>
    </div>
  );
}
