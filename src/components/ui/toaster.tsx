'use client';

import { Toaster as SonnerToaster } from 'sonner';

/**
 * Toast notification component using Sonner
 * Provides consistent toast notifications across the application
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'white',
          color: '#1f2937',
          border: '1px solid #e5e7eb',
        },
        className: 'sonner-toast',
        duration: 4000,
      }}
      theme="light"
      richColors
    />
  );
}
