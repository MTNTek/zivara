'use client';

import { ErrorBoundary } from '@/components/ui/error-boundary';

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8">
      <ErrorBoundary error={error} reset={reset} />
    </div>
  );
}
