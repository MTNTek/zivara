'use client';

import { useState } from 'react';
import { subscribeToNewsletter } from '@/features/newsletter/actions';
import { toast } from '@/lib/toast';

export function NewsletterCTA() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);
    const result = await subscribeToNewsletter(email);
    setLoading(false);
    if (result.success) {
      setSubscribed(true);
      setEmail('');
      toast.success('Subscribed', result.message || 'Deal alerts are on their way!');
    } else {
      toast.error('Error', result.error || 'Please try again.');
    }
  };

  if (subscribed) {
    return (
      <div className="bg-[#E8F5E9] border border-[#A5D6A7] rounded-lg p-5 text-center">
        <svg className="w-8 h-8 text-[#007600] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <p className="text-sm font-medium text-[#007600]">You&apos;re subscribed to deal alerts</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-5 border border-[#e7e7e7]">
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-5 h-5 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <h3 className="text-sm font-bold text-[#0F1111]">Get deal alerts</h3>
      </div>
      <p className="text-xs text-[#565959] mb-3">Be the first to know about new deals and price drops.</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="flex-1 px-3 py-2 text-sm border border-[#888C8C] rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0F1111] font-medium rounded shadow-sm transition-colors disabled:opacity-60"
        >
          {loading ? '...' : 'Subscribe'}
        </button>
      </form>
    </div>
  );
}
