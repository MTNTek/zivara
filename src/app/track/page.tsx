import type { Metadata } from 'next';
import Link from 'next/link';
import { TrackOrderForm } from '@/components/orders/track-order-form';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export const metadata: Metadata = {
  title: 'Track Your Order - Zivara',
  description: 'Enter your order number to track the status of your Zivara order.',
};

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="max-w-lg mx-auto px-4 py-12">
        <Breadcrumbs items={[{ label: 'Track Order' }]} />
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#eff6ff] rounded-full mb-4">
            <svg className="w-8 h-8 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-sm text-gray-600">
            Enter your order number to check the status of your delivery.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <TrackOrderForm />
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Have an account?{' '}
            <Link href="/login?redirect=/orders" className="text-[#2563eb] hover:text-[#1d4ed8] hover:underline">
              Sign in
            </Link>{' '}
            to see all your orders.
          </p>
        </div>
      </div>
    </div>
  );
}
