'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

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
  grandchildrenMap: Record<string, CategoryNode[]>;
  ancestors: CategoryNode[];
  currentFilters: {
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sortBy?: string;
    subcategories?: string[];
  };
  totalResults: number;
  showBrands?: boolean;
}

export function CategorySidebar({
  currentCategory,
  parentCategory,
  childCategories,
  grandchildrenMap,
  siblingCategories,
  currentFilters,
  showBrands = false,
}: CategorySidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [expandedChildren, setExpandedChildren] = useState<Set<string>>(new Set());

  const toggleChildExpanded = (childId: string) => {
    setExpandedChildren((prev) => {
      const next = new Set(prev);
      if (next.has(childId)) next.delete(childId);
      else next.add(childId);
      return next;
    });
  };

  const selectedSubs = new Set(currentFilters.subcategories || []);

  const toggleGrandchild = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get('subcategories')?.split(',').filter(Boolean) || [];
    const updated = current.includes(slug)
      ? current.filter((s) => s !== slug)
      : [...current, slug];
    if (updated.length > 0) params.set('subcategories', updated.join(','));
    else params.delete('subcategories');
    params.delete('page');
    startTransition(() => {
      router.push(`/products/category/${currentCategory.slug}?${params.toString()}`);
    });
  };

  const clearGrandchildSelections = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('subcategories');
    params.delete('page');
    startTransition(() => {
      router.push(`/products/category/${currentCategory.slug}?${params.toString()}`);
    });
  };

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
                     currentFilters.minRating || currentFilters.sortBy ||
                     selectedSubs.size > 0;

  return (
    <aside className="w-[245px] flex-shrink-0 text-[12px] leading-[20px] text-[#0F1111]" style={{ opacity: isPending ? 0.6 : 1 }}>

      {/* ── Category ── */}
      {childCategories.length > 0 && (
        <div className="pb-[12px]">
          <h3 className="font-bold text-[12px] leading-[16px] pb-[6px]">Category</h3>
          <div>
            {childCategories.map((child) => {
              const grandchildren = grandchildrenMap[child.id] || [];
              const hasGrandchildren = grandchildren.length > 0;
              const isExpanded = expandedChildren.has(child.id);

              return (
                <div key={child.id}>
                  <div className="flex items-center gap-[7px] leading-[20px]">
                    {hasGrandchildren && (
                      <button
                        onClick={() => toggleChildExpanded(child.id)}
                        className="text-[#0F1111] hover:text-[#c7511f] flex-shrink-0"
                        aria-label={isExpanded ? `Collapse ${child.name}` : `Expand ${child.name}`}
                      >
                        <svg
                          className={`w-[12px] h-[12px] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                    <Link
                      href={`/products/category/${child.slug}`}
                      className="text-[#0F1111] hover:text-[#c7511f] font-bold text-[12px] leading-[20px]"
                    >
                      {child.name}
                    </Link>
                  </div>

                  {hasGrandchildren && isExpanded && (
                    <div className="ml-[24px] pt-[2px]">
                      {selectedSubs.size > 0 && grandchildren.some((gc) => selectedSubs.has(gc.slug)) && (
                        <button
                          onClick={clearGrandchildSelections}
                          className="text-[#007185] hover:text-[#c7511f] hover:underline text-[12px] leading-[20px] flex items-center gap-[2px] mb-[2px]"
                        >
                          <span>‹</span> Clear
                        </button>
                      )}
                      {grandchildren.map((gc) => {
                        const isChecked = selectedSubs.has(gc.slug);
                        return (
                          <div key={gc.id} className="flex items-center gap-[7px] leading-[26px]">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleGrandchild(gc.slug)}
                              className="w-[16px] h-[16px] rounded border-[#888] text-[#e77600] focus:ring-[#e77600] cursor-pointer flex-shrink-0"
                            />
                            <Link
                              href={`/products/category/${gc.slug}`}
                              className={`text-[12px] hover:text-[#c7511f] ${isChecked ? 'font-bold text-[#0F1111]' : 'text-[#0F1111]'}`}
                            >
                              {gc.name}
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* If leaf category, show siblings */}
      {childCategories.length === 0 && siblingCategories.length > 0 && (
        <div className="pb-[12px]">
          <h3 className="font-bold text-[12px] leading-[16px] pb-[6px]">Category</h3>
          {parentCategory && (
            <Link
              href={`/products/category/${parentCategory.slug}`}
              className="text-[#007185] hover:text-[#c7511f] hover:underline text-[12px] leading-[20px] flex items-center gap-[2px] mb-[4px]"
            >
              <span>‹</span> {parentCategory.name}
            </Link>
          )}
          <div className={parentCategory ? 'ml-[12px]' : ''}>
            {siblingCategories.map((sibling) => {
              const isCurrentSibling = sibling.id === currentCategory.id;
              return (
                <div key={sibling.id} className="leading-[20px]">
                  <Link
                    href={`/products/category/${sibling.slug}`}
                    className={`hover:text-[#c7511f] ${isCurrentSibling ? 'font-bold text-[#0F1111]' : 'text-[#0F1111]'}`}
                  >
                    {sibling.name}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="border-t border-[#e7e7e7] my-[16px]" />

      {/* ── Eligible for free delivery ── */}
      <div className="pb-[12px]">
        <h3 className="font-bold text-[12px] leading-[16px] pb-[6px]">Eligible for free delivery</h3>
        <div className="bg-[#f7f7f7] rounded-md p-[8px]">
          <label className="flex items-center gap-[7px] cursor-pointer group leading-[20px]">
            <input
              type="checkbox"
              className="w-[16px] h-[16px] rounded border-[#888] text-[#e77600] focus:ring-[#e77600] cursor-pointer"
              disabled
            />
            <span className="group-hover:text-[#c7511f]">Free Shipping</span>
          </label>
          <p className="text-[11px] text-[#565959] mt-[4px] leading-[15px]">
            All customers get FREE Shipping on orders over $100 shipped by Zivara
          </p>
        </div>
      </div>

      <div className="border-t border-[#e7e7e7] my-[16px]" />

      {/* ── Brands (electronics only) ── */}
      {showBrands && (
      <div className="pb-[12px]">
        <h3 className="font-bold text-[12px] leading-[16px] pb-[6px]">Brands</h3>
        {['Apple', 'Samsung', 'HONOR', 'XIAOMI', 'OnePlus', 'Motorola', 'Nothing', 'HUAWEI', 'OPPO', 'realme'].map((brand) => (
          <label key={brand} className="flex items-center gap-[7px] cursor-pointer group leading-[20px]">
            <input type="checkbox" className="w-[16px] h-[16px] rounded border-[#888] text-[#e77600] focus:ring-[#e77600] cursor-pointer" disabled />
            <span className="group-hover:text-[#c7511f]">{brand}</span>
          </label>
        ))}
      </div>
      )}
      {showBrands && <div className="border-t border-[#e7e7e7] my-[16px]" />}

      {/* ── Seller (electronics only) ── */}
      {showBrands && (
      <>
      <div className="pb-[12px]">
        <h3 className="font-bold text-[12px] leading-[16px] pb-[6px]">Seller</h3>
        {['Zivara', 'Third-party Sellers'].map((seller) => (
          <label key={seller} className="flex items-center gap-[7px] cursor-pointer group leading-[20px]">
            <input type="checkbox" className="w-[16px] h-[16px] rounded border-[#888] text-[#e77600] focus:ring-[#e77600] cursor-pointer" disabled />
            <span className="group-hover:text-[#c7511f]">{seller}</span>
          </label>
        ))}
      </div>
      <div className="border-t border-[#e7e7e7] my-[16px]" />
      </>
      )}

      {/* ── Availability (electronics only) ── */}
      {showBrands && (
      <>
      <div className="pb-[12px]">
        <h3 className="font-bold text-[12px] leading-[16px] pb-[6px]">Availability</h3>
        {['In Stock', 'Include Out of Stock'].map((option) => (
          <label key={option} className="flex items-center gap-[7px] cursor-pointer group leading-[20px]">
            <input type="checkbox" className="w-[16px] h-[16px] rounded border-[#888] text-[#e77600] focus:ring-[#e77600] cursor-pointer" disabled />
            <span className="group-hover:text-[#c7511f]">{option}</span>
          </label>
        ))}
      </div>
      <div className="border-t border-[#e7e7e7] my-[16px]" />
      </>
      )}

      {/* ── Condition (electronics only) ── */}
      {showBrands && (
      <>
      <div className="pb-[12px]">
        <h3 className="font-bold text-[12px] leading-[16px] pb-[6px]">Condition</h3>
        {['New', 'Renewed', 'Used'].map((condition) => (
          <label key={condition} className="flex items-center gap-[7px] cursor-pointer group leading-[20px]">
            <input type="checkbox" className="w-[16px] h-[16px] rounded border-[#888] text-[#e77600] focus:ring-[#e77600] cursor-pointer" disabled />
            <span className="group-hover:text-[#c7511f]">{condition}</span>
          </label>
        ))}
      </div>
      <div className="border-t border-[#e7e7e7] my-[16px]" />
      </>
      )}

      {/* ── Price ── */}
      <div className="pb-[12px]">
        <h3 className="font-bold text-[12px] leading-[16px] pb-[6px]">Price</h3>
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
              className={`block w-full text-left leading-[20px] ${isActive ? 'font-bold text-[#c7511f]' : 'hover:text-[#c7511f]'}`}
            >
              {range.label}
            </button>
          );
        })}
        <div className="flex items-center gap-[4px] mt-[8px]">
          <input
            type="number"
            placeholder="Min"
            className="w-[60px] px-[6px] py-[4px] border border-[#d5d9d9] rounded-md text-[12px] leading-[16px] focus:outline-none focus:ring-1 focus:ring-[#e77600] focus:border-[#e77600]"
            defaultValue={currentFilters.minPrice || ''}
            onKeyDown={(e) => {
              if (e.key === 'Enter') updateFilter('minPrice', (e.target as HTMLInputElement).value || null);
            }}
          />
          <span className="text-[#565959]">-</span>
          <input
            type="number"
            placeholder="Max"
            className="w-[60px] px-[6px] py-[4px] border border-[#d5d9d9] rounded-md text-[12px] leading-[16px] focus:outline-none focus:ring-1 focus:ring-[#e77600] focus:border-[#e77600]"
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
            className="px-[10px] py-[4px] rounded-md text-[12px] leading-[16px] font-medium border border-[#d5d9d9] hover:brightness-95 active:brightness-90"
            style={{ background: 'linear-gradient(to bottom, #f7dfa5, #f0c14b)' }}
            aria-label="Apply price filter"
          >
            Go
          </button>
        </div>
      </div>

      <div className="border-t border-[#e7e7e7] my-[16px]" />

      {/* ── Customer Review ── */}
      <div className="pb-[12px]">
        <h3 className="font-bold text-[12px] leading-[16px] pb-[6px]">Customer Review</h3>
        {[4, 3, 2, 1].map((rating) => {
          const isActive = currentFilters.minRating === rating;
          return (
            <button
              key={rating}
              onClick={() => updateFilter('minRating', isActive ? null : rating.toString())}
              className={`flex items-center gap-[4px] w-full text-left leading-[20px] rounded px-[4px] -mx-[4px] py-[2px] hover:bg-[#f7f7f7] transition-colors cursor-pointer ${isActive ? 'font-bold' : ''}`}
            >
              <div className="flex" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill={s <= rating ? '#de7921' : 'none'} stroke="#de7921" strokeWidth={s <= rating ? 0 : 2}>
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                ))}
              </div>
              <span>& Up</span>
            </button>
          );
        })}
      </div>

      {/* Clear all filters */}
      {hasFilters && (
        <>
          <div className="border-t border-[#e7e7e7] my-[16px]" />
          <button
            onClick={clearFilters}
            className="text-[#007185] hover:text-[#c7511f] hover:underline text-[12px] leading-[20px]"
          >
            Clear all filters
          </button>
        </>
      )}
    </aside>
  );
}
