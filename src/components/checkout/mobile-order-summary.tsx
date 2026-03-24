'use client';

import { useState } from 'react';

interface MobileOrderSummaryProps {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  itemCount: number;
}

export function MobileOrderSummary({ subtotal, tax, shipping, total, itemCount }: MobileOrderSummaryProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm"
        aria-expanded={open}
        aria-controls="mobile-order-details"
      >
        <div className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 text-[#2563eb] transition-transform ${open ? 'rotate-90' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-[#2563eb] font-medium">
            {open ? 'Hide' : 'Show'} order summary ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </span>
        </div>
        <span className="text-base font-bold text-[#B12704]">${total.toFixed(2)}</span>
      </button>

      {open && (
        <div id="mobile-order-details" className="px-4 pb-4 border-t border-gray-200 pt-3 space-y-2">
          <div className="flex justify-between text-sm text-[#565959]">
            <span>Subtotal</span>
            <span className="text-[#0F1111]">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-[#565959]">
            <span>Estimated tax</span>
            <span className="text-[#0F1111]">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-[#565959]">
            <span>Shipping</span>
            {shipping === 0 ? (
              <span className="text-[#007600] font-medium">FREE</span>
            ) : (
              <span className="text-[#0F1111]">${shipping.toFixed(2)}</span>
            )}
          </div>
          <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-100">
            <span className="text-[#0F1111]">Order total</span>
            <span className="text-[#B12704]">${total.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
