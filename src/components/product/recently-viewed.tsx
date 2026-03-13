'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface RecentProduct {
  id: string;
  name: string;
  price: string;
  discountPrice?: string | null;
  imageUrl?: string;
  viewedAt: number;
}

const STORAGE_KEY = 'zivara_recently_viewed';
const MAX_ITEMS = 12;

export function trackProductView(product: Omit<RecentProduct, 'viewedAt'>) {
  if (typeof window === 'undefined') return;
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as RecentProduct[];
    const filtered = stored.filter((p) => p.id !== product.id);
    filtered.unshift({ ...product, viewedAt: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_ITEMS)));
  } catch { /* ignore */ }
}

export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const [items, setItems] = useState<RecentProduct[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as RecentProduct[];
      setItems(excludeId ? stored.filter((p) => p.id !== excludeId) : stored);
    } catch { /* ignore */ }
  }, [excludeId]);

  if (items.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Recently Viewed</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {items.slice(0, 8).map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="flex-shrink-0 w-36 group"
          >
            <div className="relative w-36 h-36 bg-gray-50 rounded-lg overflow-hidden mb-2">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-contain p-2 group-hover:scale-105 transition-transform"
                  sizes="144px"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Image</div>
              )}
            </div>
            <p className="text-sm text-gray-900 line-clamp-2 group-hover:text-teal-600 transition-colors">
              {product.name}
            </p>
            <p className="text-sm font-semibold text-gray-900">
              ${Number(product.discountPrice || product.price).toFixed(2)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
