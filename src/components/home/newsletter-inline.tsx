'use client';

import { useState } from 'react';
import { subscribeToNewsletter } from '@/features/newsletter/actions';

export function NewsletterInline() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;
    setLoading(true);
    const result = await subscribeToNewsletter(email);
    setLoading(false);
    if (result.success) {
      setSubmitted(true);
      setMessage(result.message || "You're subscribed — check your inbox!");
      setEmail('');
    } else {
      setMessage(result.error || 'Something went wrong.');
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg p-6 sm:p-8 text-white">
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-lg font-bold">Get 10% off your first order</h3>
          <p className="text-sm text-blue-200 mt-1">Subscribe for exclusive deals, new arrivals, and more.</p>
        </div>
        {submitted ? (
          <div className="flex items-center gap-2 text-sm font-medium text-green-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 w-full sm:w-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setMessage(''); }}
              placeholder="Enter your email"
              required
              className="flex-1 sm:w-64 px-4 py-2.5 rounded-full text-sm text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0F1111] px-5 py-2.5 rounded-full text-sm font-semibold transition-colors whitespace-nowrap disabled:opacity-60"
            >
              {loading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        )}
        {!submitted && message && (
          <p className="text-xs text-red-300">{message}</p>
        )}
      </div>
    </div>
  );
}
