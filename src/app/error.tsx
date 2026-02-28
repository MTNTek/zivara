'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development
    console.error('Root error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md text-center">
        <div className="mb-6 text-8xl">⚠️</div>
        <h1 className="mb-3 text-3xl font-bold text-gray-900">
          Something went wrong
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          We encountered an unexpected error. Please try refreshing the page.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="rounded-md bg-teal-600 px-6 py-3 text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-md border border-gray-300 bg-white px-6 py-3 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            Go to homepage
          </a>
        </div>
      </div>
    </div>
  );
}
