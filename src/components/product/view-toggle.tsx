'use client';

import { useState, useEffect } from 'react';

const VIEW_KEY = 'zivara-product-view';

export type ViewMode = 'grid' | 'list';

export function useViewMode(): [ViewMode, (mode: ViewMode) => void] {
  const [view, setView] = useState<ViewMode>('grid');

  useEffect(() => {
    const saved = localStorage.getItem(VIEW_KEY) as ViewMode;
    if (saved === 'list' || saved === 'grid') setView(saved);
  }, []);

  const setAndSave = (mode: ViewMode) => {
    setView(mode);
    localStorage.setItem(VIEW_KEY, mode);
  };

  return [view, setAndSave];
}

interface ViewToggleProps {
  view: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
      <button
        onClick={() => onChange('grid')}
        className={`p-1.5 transition-colors ${view === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
        aria-label="Grid view"
        title="Grid view"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
          <rect x="1" y="1" width="6" height="6" rx="1" />
          <rect x="9" y="1" width="6" height="6" rx="1" />
          <rect x="1" y="9" width="6" height="6" rx="1" />
          <rect x="9" y="9" width="6" height="6" rx="1" />
        </svg>
      </button>
      <button
        onClick={() => onChange('list')}
        className={`p-1.5 transition-colors ${view === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
        aria-label="List view"
        title="List view"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
          <rect x="1" y="1" width="14" height="3" rx="1" />
          <rect x="1" y="6.5" width="14" height="3" rx="1" />
          <rect x="1" y="12" width="14" height="3" rx="1" />
        </svg>
      </button>
    </div>
  );
}
