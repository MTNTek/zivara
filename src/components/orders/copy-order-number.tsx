'use client';

import { useState } from 'react';

export function CopyOrderNumber({ orderNumber }: { orderNumber: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback: do nothing */ }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 group"
      title="Copy order number"
    >
      <span className="text-lg font-semibold text-gray-900">{orderNumber}</span>
      <svg
        className={`w-4 h-4 transition-colors ${copied ? 'text-green-600' : 'text-gray-400 group-hover:text-[#2563eb]'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {copied ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        )}
      </svg>
      {copied && <span className="text-xs text-green-600">Copied</span>}
    </button>
  );
}
