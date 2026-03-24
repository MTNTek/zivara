'use client';

export function TrustBadges() {
  return (
    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-200">
      <div className="flex items-center gap-2 text-xs text-[#565959]">
        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span>Genuine Products</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-[#565959]">
        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </div>
        <span>Easy Returns</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-[#565959]">
        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span>Fast Delivery</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-[#565959]">
        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <span>Secure Checkout</span>
      </div>
    </div>
  );
}
