'use client';

/**
 * Shows a subtle "lowest price in 30 days" or "price dropped" hint
 * when a product has a discount. This is a UI-only component that
 * adds perceived value — no actual price history tracking.
 */
export function PriceHistoryHint({ discountPct }: { discountPct: number }) {
  if (discountPct <= 0) return null;

  const label =
    discountPct >= 30
      ? 'Lowest price in 30 days'
      : discountPct >= 15
        ? 'Great price'
        : 'Price dropped';

  return (
    <div className="flex items-center gap-1 mt-1">
      <svg className="w-3.5 h-3.5 text-[#007600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
      <span className="text-[11px] text-[#007600] font-medium">{label}</span>
    </div>
  );
}
