'use client';

import { ErrorBoundary } from '@/components/ui/error-boundary';

export default function OrderDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <ErrorBoundary error={error} reset={reset} />
    </div>
  );
}
