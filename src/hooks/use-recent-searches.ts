'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'zivara_recent_searches';
const MAX_ITEMS = 6;

export function useRecentSearches() {
  const [searches, setSearches] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSearches(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const addSearch = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, MAX_ITEMS);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const removeSearch = useCallback((query: string) => {
    setSearches((prev) => {
      const updated = prev.filter((s) => s !== query);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { searches, addSearch, removeSearch, clearAll };
}
