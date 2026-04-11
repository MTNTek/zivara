'use client';

import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  sku: string | null;
  price: string;
  discountPrice: string | null;
  isActive: boolean;
  category?: { name: string } | null;
  averageRating: string | null;
  reviewCount: number | null;
  inventory?: { quantity: number } | null;
}

export function ProductExportButton({ products }: { products: Product[] }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    setExporting(true);
    try {
      const headers = ['Name', 'SKU', 'Category', 'Price', 'Sale Price', 'Status', 'Stock', 'Rating', 'Reviews'];
      const rows = products.map(p => [
        `"${p.name.replace(/"/g, '""')}"`,
        p.sku || '',
        p.category?.name || '',
        p.price,
        p.discountPrice || '',
        p.isActive ? 'Active' : 'Inactive',
        p.inventory?.quantity?.toString() || '0',
        p.averageRating ? Number(p.averageRating).toFixed(1) : '0.0',
        (p.reviewCount || 0).toString(),
      ]);

      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zivara-products-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting || products.length === 0}
      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      {exporting ? 'Exporting...' : 'Export CSV'}
    </button>
  );
}
