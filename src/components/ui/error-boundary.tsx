'use client';

import { useEffect } from 'react';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log error to console in development
    console.error('Error caught by boundary:', error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <div className="max-w-md text-center">
        <div className="mb-4 text-6xl">⚠️</div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          Something went wrong
        </h2>
        <p className="mb-6 text-gray-600">
          We&apos;re sorry for the inconvenience. Please try again.
        </p>
        <button
          onClick={reset}
          className="rounded-full bg-[#fbbf24] px-6 py-2.5 text-[#0F1111] font-medium hover:bg-[#f59e0b] focus:outline-none focus:ring-2 focus:ring-[#f59e0b] focus:ring-offset-2 transition-colors border border-[#FCD200]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
