'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface SortSelectProps {
  options: { value: string; label: string }[];
  paramName?: string;
}

export function SortSelect({ options, paramName = 'sort' }: SortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramName) || options[0]?.value || '';

  return (
    <select
      value={current}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(paramName, e.target.value);
        router.push(`?${params.toString()}`);
      }}
      className="text-sm border border-[#D5D9D9] rounded-lg px-3 py-1.5 bg-[#F0F2F2] text-[#0F1111] focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
