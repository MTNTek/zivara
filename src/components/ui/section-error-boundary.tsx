'use client';

import { useEffect } from 'react';

interface SectionErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
}

export function SectionErrorBoundary({ 
  error, 
  reset,
  title = 'Unable to load this section'
}: SectionErrorBoundaryProps) {
  useEffect(() => {
    // Log error to console in development
    console.error('Section error:', error);
  }, [error]);

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <p className="mt-1 text-sm text-red-700">
            Something went wrong while loading this content.
          </p>
          <div className="mt-4">
            <button
              onClick={reset}
              className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
