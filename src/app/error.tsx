'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EAEDED] px-4">
      <div className="max-w-md text-center">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-4 text-6xl">⚠️</div>
          <h1 className="mb-2 text-xl font-bold text-[#0F1111]">
            Something went wrong
          </h1>
          <p className="mb-6 text-sm text-[#565959]">
            We encountered an unexpected error. Please try refreshing the page.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={reset}
              className="rounded-full bg-[#fbbf24] px-6 py-2.5 text-sm font-medium text-[#0F1111] hover:bg-[#f59e0b] transition-colors focus:outline-none focus:ring-2 focus:ring-[#fbbf24] focus:ring-offset-2"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="rounded-full border border-[#D5D9D9] bg-white px-6 py-2.5 text-sm font-medium text-[#0F1111] hover:bg-[#F7FAFA] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
        <div className="mt-4 flex justify-center gap-4 text-xs text-[#565959]">
          <Link href="/products" className="hover:text-[#1d4ed8] hover:underline">Products</Link>
          <Link href="/contact" className="hover:text-[#1d4ed8] hover:underline">Contact Us</Link>
          <Link href="/faq" className="hover:text-[#1d4ed8] hover:underline">FAQ</Link>
        </div>
      </div>
    </div>
  );
}
