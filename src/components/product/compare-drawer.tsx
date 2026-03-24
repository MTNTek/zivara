'use client';

import { useCompare } from '@/hooks/use-compare';
import Link from 'next/link';

export function CompareDrawer() {
  const { items, remove, clear } = useCompare();

  if (items.length === 0) return null;

  return (
    <div className="fixed left-0 right-0 z-50 bg-white border-t-2 border-[#2563eb] shadow-lg bottom-14 md:bottom-0">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-x-auto flex-1">
            <span className="text-sm font-medium text-[#0f1111] whitespace-nowrap">
              Compare ({items.length})
            </span>
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1.5 flex-shrink-0">
                {item.imageUrl && (
                  <img src={item.imageUrl} alt="" className="w-8 h-8 object-contain rounded" />
                )}
                <span className="text-xs text-[#0f1111] max-w-[120px] truncate">{item.name}</span>
                <button
                  onClick={() => remove(item.id)}
                  className="text-[#565959] hover:text-red-600 ml-1"
                  aria-label={`Remove ${item.name} from comparison`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={clear}
              className="text-xs text-[#565959] hover:text-[#1d4ed8] hover:underline"
            >
              Clear all
            </button>
            {items.length >= 2 && (
              <Link
                href={`/products/compare?ids=${items.map(i => i.id).join(',')}`}
                className="px-4 py-2 bg-[#fbbf24] text-[#0F1111] text-sm font-medium rounded-full hover:bg-[#f59e0b] border border-[#FCD200] transition-colors"
              >
                Compare Now
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
