'use client';

import { useState, useTransition } from 'react';
import { submitContactMessage } from '@/features/contact/actions';

export default function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };

    startTransition(async () => {
      const result = await submitContactMessage(data);
      if (result.success) {
        setStatus('success');
        form.reset();
      } else {
        setStatus('error');
        setErrorMsg(result.error || 'Something went wrong.');
      }
    });
  }

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-semibold text-green-800 mb-1">Message Sent</h3>
        <p className="text-green-700 text-sm mb-4">Thank you for reaching out. We&apos;ll get back to you within 24 hours.</p>
        <button
          onClick={() => setStatus('idle')}
          className="text-sm text-green-700 underline hover:text-green-900"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input type="text" id="name" name="name" required maxLength={255}
            className="w-full px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e77600] focus:border-transparent text-base" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" id="email" name="email" required maxLength={255}
            className="w-full px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e77600] focus:border-transparent text-base" />
        </div>
      </div>
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
        <select id="subject" name="subject" required
          className="w-full px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e77600] focus:border-transparent text-base bg-white">
          <option value="">Select a topic</option>
          <option value="Order Issue">Order Issue</option>
          <option value="Product Question">Product Question</option>
          <option value="Product Issue">Product Issue</option>
          <option value="Return / Refund">Return / Refund</option>
          <option value="Shipping Inquiry">Shipping Inquiry</option>
          <option value="Account Help">Account Help</option>
          <option value="Partnership">Partnership</option>
          <option value="Feedback">Feedback</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <textarea id="message" name="message" rows={5} required maxLength={5000}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e77600] focus:border-transparent text-base resize-y" 
          placeholder="Describe your issue or question..." />
      </div>
      <button type="submit" disabled={isPending}
        className="bg-[#fbbf24] text-[#0F1111] px-8 py-3 min-h-[44px] rounded-full font-semibold hover:bg-[#f59e0b] transition-colors disabled:opacity-50 border border-[#FCD200] shadow-sm">
        {isPending ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
