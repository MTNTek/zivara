'use client';

import { useState, useEffect, useCallback } from 'react';

export interface CompareProduct {
  id: string;
  name: string;
  price: string;
  discountPrice: string | null;
  imageUrl?: string;
  category?: string;
}

const MAX_COMPARE = 4;
const STORAGE_KEY = 'zivara-compare';

function getStored(): CompareProduct[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function setStored(items: CompareProduct[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('compare-updated'));
}

export function useCompare() {
  const [items, setItems] = useState<CompareProduct[]>([]);

  useEffect(() => {
    setItems(getStored());
    const handler = () => setItems(getStored());
    window.addEventListener('compare-updated', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('compare-updated', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const add = useCallback((product: CompareProduct) => {
    const current = getStored();
    if (current.length >= MAX_COMPARE) return false;
    if (current.some(p => p.id === product.id)) return false;
    const updated = [...current, product];
    setStored(updated);
    setItems(updated);
    return true;
  }, []);

  const remove = useCallback((productId: string) => {
    const updated = getStored().filter(p => p.id !== productId);
    setStored(updated);
    setItems(updated);
  }, []);

  const clear = useCallback(() => {
    setStored([]);
    setItems([]);
  }, []);

  const has = useCallback((productId: string) => {
    return items.some(p => p.id === productId);
  }, [items]);

  return { items, add, remove, clear, has, isFull: items.length >= MAX_COMPARE };
}
