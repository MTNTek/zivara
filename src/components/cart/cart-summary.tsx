'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { validateCoupon } from '@/features/coupons/actions';
import { toast } from '@/lib/toast';

interface CartSummaryProps {
  subtotal: number;
  itemCount?: number;
  totalQuantity: number;
}

export function CartSummary({ subtotal, totalQuantity }: CartSummaryProps) {
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [isPending, startTransition] = useTransition();
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string;
    code: string;
    discount: number;
    description: string | null;
  } | null>(null);

  const discount = appliedCoupon?.discount ?? 0;
  const tax = (subtotal - discount) * 0.1;
  const shipping = subtotal >= 50 ? 0 : 5;
  const total = subtotal - discount + tax + shipping;
  const freeShippingProgress = Math.min((subtotal / 50) * 100, 100);

  const handleApplyCoupon = () => {
    if (!promoCode.trim()) return;
    startTransition(async () => {
      const result = await validateCoupon(promoCode.trim(), subtotal);
      if (result.success && result.coupon && result.discount !== undefined) {
        setAppliedCoupon({
          id: result.coupon.id,
          code: result.coupon.code,
          discount: result.discount,
          description: result.coupon.description,
        });
        toast.success('Coupon applied', `You saved $${result.discount.toFixed(2)}`);
      } else {
        toast.error('Invalid coupon', result.error || 'Could not apply coupon');
      }
    });
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setPromoCode('');
    toast.success('Coupon removed', '');
  };

  return (
    <div>
      {/* Free shipping progress */}
      {subtotal < 50 ? (
        <div className="mb-4 p-3 bg-[#FFF8E1] border border-[#FFE082] rounded-lg">
          <p className="text-xs text-[#0F1111] mb-1.5">
            Add <span className="font-bold text-[#2563eb]">${(50 - subtotal).toFixed(2)}</span> more for <span className="font-bold text-[#007600]">FREE shipping</span>
          </p>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2563eb] rounded-full transition-all duration-300"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-[#E8F5E9] border border-[#A5D6A7] rounded-lg flex items-center gap-2">
          <svg className="w-4 h-4 text-[#007600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-xs text-[#007600] font-medium">Your order qualifies for FREE shipping</p>
        </div>
      )}

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm text-[#565959]">
          <span>Subtotal ({totalQuantity} items)</span>
          <span className="text-[#0F1111]">${subtotal.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-[#007600]">Coupon ({appliedCoupon?.code})</span>
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
        <div className="border-t border-[#e7e7e7] pt-3">
          <div className="flex justify-between">
            <span className="text-lg font-bold text-[#B12704]">Order total</span>
            <span className="text-lg font-bold text-[#B12704]">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <Link
        href="/checkout"
        onClick={() => {
          if (appliedCoupon) {
            sessionStorage.setItem('zivara_coupon', JSON.stringify(appliedCoupon));
          } else {
            sessionStorage.removeItem('zivara_coupon');
          }
        }}
        className="block w-full bg-[#fbbf24] text-[#0F1111] text-center px-6 py-3 rounded-full font-medium hover:bg-[#f59e0b] transition-colors mb-3"
      >
        Proceed to Checkout
      </Link>

      {/* Promo code */}
      <div className="mb-3">
        {appliedCoupon ? (
          <div className="flex items-center justify-between p-2.5 bg-[#E8F5E9] border border-[#A5D6A7] rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#007600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <div>
                <span className="text-sm font-medium text-[#007600]">{appliedCoupon.code}</span>
                {appliedCoupon.description && (
                  <p className="text-[10px] text-[#565959]">{appliedCoupon.description}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="text-xs text-[#565959] hover:text-red-600 transition-colors"
            >
              Remove
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => setPromoOpen(!promoOpen)}
              className="flex items-center gap-1 text-sm text-[#2563eb] hover:text-[#1d4ed8] hover:underline"
            >
              <svg className={`w-3 h-3 transition-transform ${promoOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Add a promo code
            </button>
            {promoOpen && (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  placeholder="Enter code"
                  className="flex-1 px-3 py-1.5 text-sm border border-[#888C8C] rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb] uppercase"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={isPending || !promoCode.trim()}
                  className="px-4 py-1.5 text-sm bg-gray-100 border border-[#888C8C] rounded shadow-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {isPending ? '...' : 'Apply'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Link
        href="/products"
        className="block w-full text-center text-[#2563eb] hover:text-[#1d4ed8] hover:underline text-sm"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
