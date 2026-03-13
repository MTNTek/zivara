'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';

interface SuggestionData {
  suggestions: string[];
  products: { id: string; name: string; price: string; discountPrice: string | null }[];
}

interface SearchSuggestionsProps {
  query: string;
  visible: boolean;
  onSelect: (text: string) => void;
}

export function SearchSuggestions({ query, visible, onSelect }: SearchSuggestionsProps) {
  const [data, setData] = useState<SuggestionData | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const prevQueryRef = useRef(query);

  const fetchSuggestions = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/products/search-suggestions?q=${encodeURIComponent(q)}`
      );
      if (res.ok) setData(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!visible || query.length < 2) {
      prevQueryRef.current = query;
      return;
    }
    if (prevQueryRef.current !== query) {
      prevQueryRef.current = query;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, visible, fetchSuggestions]);

  if (!visible || query.length < 2 || (!data && !loading)) return null;

  const hasResults = data && (data.suggestions.length > 0 || data.products.length > 0);

  return (
    <div className="absolute left-0 right-0 top-full mt-1 bg-white shadow-lg z-50 border border-gray-200 rounded-md max-h-80 overflow-y-auto">
      {loading && !data && (
        <div className="p-4 text-sm text-gray-500">Searching...</div>
      )}
      {data && !hasResults && (
        <div className="p-4 text-sm text-gray-500">No results for &quot;{query}&quot;</div>
      )}
      {data?.suggestions && data.suggestions.length > 0 && (
        <div className="p-2 border-b border-gray-100">
          <p className="text-xs text-gray-500 px-2 mb-1">Suggestions</p>
          {data.suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); onSelect(s); }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {s}
            </button>
          ))}
        </div>
      )}
      {data?.products && data.products.length > 0 && (
        <div className="p-2">
          <p className="text-xs text-gray-500 px-2 mb-1">Products</p>
          {data.products.map((p) => (
            <Link
              key={p.id}
              href={`/products/${p.id}`}
              onMouseDown={(e) => e.preventDefault()}
              className="flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 rounded"
            >
              <span className="text-gray-900 line-clamp-1">{p.name}</span>
              <span className="text-gray-600 font-medium flex-shrink-0 ml-2">
                ${Number(p.discountPrice || p.price).toFixed(2)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
