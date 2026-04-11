'use client';

import { useEffect, useState } from 'react';

interface CheckoutOrderSummaryProps {
  subtotal: number;
  itemCount: number;
  children?: React.ReactNode;
}

interface CouponData {
  id: string;
  code: string;
  discount: number;
  description: string | null;
}

export function CheckoutOrderSummary({ subtotal, itemCount, children }: CheckoutOrderSummaryProps) {
  const [coupon, setCoupon] = useState<CouponData | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('zivara_coupon');
      if (stored) setCoupon(JSON.parse(stored));
    } catch {}
  }, []);

  const discount = coupon?.discount ?? 0;
  const tax = (subtotal - discount) * 0.1;
  const shipping = subtotal >= 50 ? 0 : 5;
  const total = subtotal - discount + tax + shipping;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
      <h2 className="text-lg font-semibold text-[#0F1111] mb-4">Order Summary</h2>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm text-[#565959]">
          <span>Subtotal ({itemCount} items)</span>
          <span className="text-[#0F1111]">${subtotal.toFixed(2)}</span>
        </div>
        {discount > 0 && coupon && (
          <div className="flex justify-between text-sm">
            <span className="text-[#007600] flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {coupon.code}
            </span>
            <span className="text-[#007600] font-medium">-${discount.toFixed(2)}</span>
          </div>
        )}
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
        {shipping > 0 && (
          <div className="bg-[#F0F2F2] rounded-lg p-2.5 text-xs text-[#0F1111]">
            <p>Add <span className="font-medium text-[#2563eb]">${(50 - subtotal).toFixed(2)}</span> more for free shipping</p>
            <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2563eb] rounded-full"
                style={{ width: `${Math.min((subtotal / 50) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
        <div className="border-t border-[#e7e7e7] pt-3">
          <div className="flex justify-between">
            <span className="text-lg font-bold text-[#B12704]">Order total</span>
            <span className="text-lg font-bold text-[#B12704]">${total.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <p className="text-xs text-[#007600] mt-1">You save ${discount.toFixed(2)} with coupon</p>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}
