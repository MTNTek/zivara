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
          We're sorry for the inconvenience. Please try again.
        </p>
        <button
          onClick={reset}
          className="rounded-md bg-teal-600 px-4 py-2 text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
