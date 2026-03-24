'use client';

import { useState, useTransition } from 'react';
import { toast } from '@/lib/toast';
import { subscribeStockNotification } from '@/features/notifications/stock-actions';

export function NotifyStockButton({ productName, productId }: { productName: string; productId?: string }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    startTransition(async () => {
      if (productId) {
        const result = await subscribeStockNotification(productId, email);
        if (!result.success) {
          toast.error('Error', result.error || 'Could not set alert');
          return;
        }
      }
      setSubmitted(true);
      setOpen(false);
      toast.success('Alert set', `We'll notify you when "${productName}" is back in stock.`);
    });
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-[#007600]">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Stock alert set
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-[#2563eb] hover:text-[#1d4ed8] hover:underline"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        Notify me when available
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-1">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        required
        autoFocus
        className="flex-1 px-2 py-1 text-xs border border-[#888C8C] rounded focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]"
      />
      <button
        type="submit"
        disabled={isPending}
        className="px-3 py-1 text-xs bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0F1111] font-medium rounded transition-colors disabled:opacity-50"
      >
        {isPending ? '...' : 'Notify'}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="px-2 py-1 text-xs text-[#565959] hover:text-[#0F1111]"
      >
        ✕
      </button>
    </form>
  );
}
