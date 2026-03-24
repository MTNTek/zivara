interface DeliveryEstimateProps {
  isInStock: boolean;
}

export function DeliveryEstimate({ isInStock }: DeliveryEstimateProps) {
  if (!isInStock) return null;

  const now = new Date();
  // Standard delivery: 3-5 business days
  const standardMin = addBusinessDays(now, 3);
  const standardMax = addBusinessDays(now, 5);
  // Express: 1-2 business days
  const expressDate = addBusinessDays(now, 2);

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-start gap-2">
        <svg className="w-4 h-4 text-[#2563eb] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
        <div>
          <p className="text-[#0f1111]">
            <span className="text-[#2563eb] font-medium">FREE delivery </span>
            <span className="font-bold">{fmt(standardMin)} - {fmt(standardMax)}</span>
          </p>
          <p className="text-xs text-[#565959]">Standard shipping</p>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <svg className="w-4 h-4 text-[#2563eb] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <div>
          <p className="text-[#0f1111]">
            Or fastest delivery <span className="font-bold">{fmt(expressDate)}</span>
          </p>
          <p className="text-xs text-[#565959]">Order within {getOrderWithinHours()} hrs</p>
        </div>
      </div>
    </div>
  );
}

function addBusinessDays(start: Date, days: number): Date {
  const result = new Date(start);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dow = result.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return result;
}

function getOrderWithinHours(): number {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setHours(14, 0, 0, 0); // 2 PM cutoff
  if (now >= cutoff) {
    // Next day cutoff
    cutoff.setDate(cutoff.getDate() + 1);
  }
  return Math.max(1, Math.floor((cutoff.getTime() - now.getTime()) / 3600000));
}
