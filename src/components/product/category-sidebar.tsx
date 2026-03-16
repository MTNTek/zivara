'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

interface CategorySidebarProps {
  currentCategory: CategoryNode;
  parentCategory: CategoryNode | null;
  siblingCategories: CategoryNode[];
  childCategories: CategoryNode[];
  ancestors: CategoryNode[];
  currentFilters: {
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sortBy?: string;
  };
  totalResults: number;
}

export function CategorySidebar({
  currentCategory,
  parentCategory,
  siblingCategories,
  childCategories,
  ancestors,
  currentFilters,
  totalResults,
}: CategorySidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    startTransition(() => {
      router.push(`/products/category/${currentCategory.slug}?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      router.push(`/products/category/${currentCategory.slug}`);
    });
  };

  const hasFilters = currentFilters.minPrice || currentFilters.maxPrice ||
                     currentFilters.minRating || currentFilters.sortBy;

  return (
    <aside className="w-[220px] flex-shrink-0 text-[13px] leading-[19px]" style={{ opacity: isPending ? 0.6 : 1 }}>

      {/* ── Category Section ── */}
      <div className="mb-1">
        <h3 className="font-bold text-[#0F1111] text-[16px] leading-[22px] mb-1.5">Category</h3>

        {/* Ancestor back-links with ‹ */}
        {ancestors.map((ancestor, i) => (
          <div key={ancestor.id} style={{ paddingLeft: `${i * 12}px` }}>
            <Link
              href={`/products/category/${ancestor.slug}`}
              className="text-[#0F1111] hover:text-[#c7511f] inline-flex items-center gap-0.5"
            >
              <span className="text-[13px]">‹</span>
              <span className="underline">{ancestor.name}</span>
            </Link>
          </div>
        ))}

        {/* Current category — bold, no link */}
        <div style={{ paddingLeft: `${(ancestors.length) * 12 + 8}px` }} className="mt-0.5">
          <span className="font-bold text-[#0F1111]">{currentCategory.name}</span>
        </div>

        {/* Child subcategories */}
        {childCategories.length > 0 && (
          <div className="mt-0.5 space-y-0.5" style={{ paddingLeft: `${(ancestors.length + 1) * 12 + 8}px` }}>
            {childCategories.map((child) => (
              <div key={child.id}>
                <Link
                  href={`/products/category/${child.slug}`}
                  className="text-[#0F1111] hover:text-[#c7511f]"
                >
                  {child.name}
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* If leaf category, show siblings */}
        {childCategories.length === 0 && siblingCategories.length > 0 && (
          <div className="mt-0.5 space-y-0.5" style={{ paddingLeft: `${ancestors.length * 12 + 8}px` }}>
            {siblingCategories.map((sibling) => (
              <div key={sibling.id}>
                <Link
                  href={`/products/category/${sibling.slug}`}
                  className="text-[#0F1111] hover:text-[#c7511f]"
                >
                  {sibling.name}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-[#e7e7e7] my-3" />

      {/* ── Delivery Day ── */}
      <div className="mb-1">
        <h3 className="font-bold text-[#0F1111] text-[13px] mb-1.5">Delivery Day</h3>
        <div className="space-y-1.5">
          {['Get it in 2 Hours', 'Get It Today', 'Get It by Tomorrow'].map((label) => (
            <label key={label} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                className="w-[15px] h-[15px] rounded border-[#888] text-[#e77600] focus:ring-[#e77600] cursor-pointer"
                disabled
              />
              <span className="text-[#0F1111] group-hover:text-[#c7511f]">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-[#e7e7e7] my-3" />

      {/* ── Eligible for free delivery ── */}
      <div className="mb-1">
        <h3 className="font-bold text-[#0F1111] text-[13px] mb-1.5">Eligible for free delivery</h3>
        <label className="flex items-start gap-2 cursor-pointer group">
          <input
            type="checkbox"
            className="w-[15px] h-[15px] rounded border-[#888] text-[#e77600] focus:ring-[#e77600] cursor-pointer mt-0.5"
            disabled
          />
          <span className="text-[#0F1111] group-hover:text-[#c7511f]">Free Shipping</span>
        </label>
        <p className="text-[12px] text-[#565959] mt-1.5 leading-[16px]">
          All customers get FREE Shipping on orders over $100 shipped by Zivara
        </p>
      </div>

      <div className="border-t border-[#e7e7e7] my-3" />

      {/* ── Brands ── */}
      <div className="mb-1">
        <h3 className="font-bold text-[#0F1111] text-[13px] mb-1.5">Brands</h3>
        <div className="space-y-1.5">
          {['Apple', 'Samsung', 'HONOR', 'XIAOMI', 'OnePlus', 'Motorola', 'Nothing', 'HUAWEI', 'OPPO', 'realme'].map((brand) => (
            <label key={brand} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                className="w-[15px] h-[15px] rounded border-[#888] text-[#e77600] focus:ring-[#e77600] cursor-pointer"
                disabled
              />
              <span className="text-[#0F1111] group-hover:text-[#c7511f]">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-[#e7e7e7] my-3" />

      {/* ── Price ── */}
      <div className="mb-1">
        <h3 className="font-bold text-[#0F1111] text-[13px] mb-1.5">Price</h3>
        <div className="space-y-1">
          {[
            { label: 'Under $25', min: undefined, max: 25 },
            { label: '$25 to $50', min: 25, max: 50 },
            { label: '$50 to $100', min: 50, max: 100 },
            { label: '$100 to $200', min: 100, max: 200 },
            { label: '$200 & Above', min: 200, max: undefined },
          ].map((range) => {
            const isActive = currentFilters.minPrice === range.min && currentFilters.maxPrice === range.max;
            return (
              <button
                key={range.label}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  if (isActive) {
                    params.delete('minPrice');
                    params.delete('maxPrice');
                  } else {
                    if (range.min !== undefined) params.set('minPrice', range.min.toString());
                    else params.delete('minPrice');
                    if (range.max !== undefined) params.set('maxPrice', range.max.toString());
                    else params.delete('maxPrice');
                  }
                  params.delete('page');
                  startTransition(() => {
                    router.push(`/products/category/${currentCategory.slug}?${params.toString()}`);
                  });
                }}
                className={`block w-full text-left ${isActive ? 'font-bold text-[#c7511f]' : 'text-[#0F1111] hover:text-[#c7511f]'}`}
              >
                {range.label}
              </button>
            );
          })}
        </div>

        {/* Custom price inputs */}
        <div className="flex items-center gap-1 mt-2">
          <input
            type="number"
            placeholder="Min"
            className="w-16 px-2 py-1 border border-[#888] rounded text-[12px] focus:outline-none focus:ring-1 focus:ring-[#e77600]"
            defaultValue={currentFilters.minPrice || ''}
            onKeyDown={(e) => {
              if (e.key === 'Enter') updateFilter('minPrice', (e.target as HTMLInputElement).value || null);
            }}
          />
          <span className="text-[#565959]">-</span>
          <input
            type="number"
            placeholder="Max"
            className="w-16 px-2 py-1 border border-[#888] rounded text-[12px] focus:outline-none focus:ring-1 focus:ring-[#e77600]"
            defaultValue={currentFilters.maxPrice || ''}
            onKeyDown={(e) => {
              if (e.key === 'Enter') updateFilter('maxPrice', (e.target as HTMLInputElement).value || null);
            }}
          />
          <button
            onClick={() => {
              const minEl = document.querySelector('input[placeholder="Min"]') as HTMLInputElement;
              const maxEl = document.querySelector('input[placeholder="Max"]') as HTMLInputElement;
              const params = new URLSearchParams(searchParams.toString());
              if (minEl?.value) params.set('minPrice', minEl.value); else params.delete('minPrice');
              if (maxEl?.value) params.set('maxPrice', maxEl.value); else params.delete('maxPrice');
              params.delete('page');
              startTransition(() => {
                router.push(`/products/category/${currentCategory.slug}?${params.toString()}`);
              });
            }}
            className="px-2 py-1 bg-[#f0f2f2] border border-[#888] rounded text-[12px] hover:bg-[#e3e6e6]"
            aria-label="Apply price filter"
          >
            Go
          </button>
        </div>
      </div>

      <div className="border-t border-[#e7e7e7] my-3" />

      {/* ── Customer Review ── */}
      <div className="mb-1">
        <h3 className="font-bold text-[#0F1111] text-[13px] mb-1.5">Customer Review</h3>
        <div className="space-y-1">
          {[4, 3, 2, 1].map((rating) => {
            const isActive = currentFilters.minRating === rating;
            return (
              <button
                key={rating}
                onClick={() => updateFilter('minRating', isActive ? null : rating.toString())}
                className={`flex items-center gap-1 w-full text-left ${isActive ? 'font-bold' : ''}`}
              >
                <div className="flex" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill={s <= rating ? '#de7921' : 'none'} stroke="#de7921" strokeWidth={s <= rating ? 0 : 2}>
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  ))}
                </div>
                <span className="text-[#0F1111]">& Up</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Clear all filters */}
      {hasFilters && (
        <>
          <div className="border-t border-[#e7e7e7] my-3" />
          <button
            onClick={clearFilters}
            className="text-[#007185] hover:text-[#c7511f] hover:underline text-[13px]"
          >
            Clear all filters
          </button>
        </>
      )}
    </aside>
  );
}
