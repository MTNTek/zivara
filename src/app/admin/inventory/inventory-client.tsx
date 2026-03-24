'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { adjustStock, updateLowStockThreshold } from '@/features/inventory/actions';
import { ButtonSpinner } from '@/components/ui/spinner';

interface InventoryProduct {
  id: string;
  name: string;
  sku: string | null;
  isActive: boolean;
  inventory: { quantity: number; lowStockThreshold: number } | null;
  images: { thumbnailUrl: string; imageUrl: string }[];
  category: { name: string } | null;
}

type Filter = 'all' | 'low' | 'out';

export function InventoryClient({ initialProducts }: { initialProducts: InventoryProduct[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState('');
  const [isPending, startTransition] = useTransition();

  const filtered = products.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.sku?.toLowerCase().includes(q)) return false;
    }
    const qty = p.inventory?.quantity ?? 0;
    const threshold = p.inventory?.lowStockThreshold ?? 10;
    if (filter === 'low') return qty > 0 && qty <= threshold;
    if (filter === 'out') return qty === 0;
    return true;
  });

  const lowCount = products.filter(
    (p) => (p.inventory?.quantity ?? 0) > 0 && (p.inventory?.quantity ?? 0) <= (p.inventory?.lowStockThreshold ?? 10)
  ).length;
  const outCount = products.filter((p) => (p.inventory?.quantity ?? 0) === 0).length;

  const handleSave = (productId: string) => {
    const qty = parseInt(editQty, 10);
    if (isNaN(qty) || qty < 0) return;

    startTransition(async () => {
      const result = await adjustStock(productId, qty);
      if (result.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId
              ? { ...p, inventory: { ...(p.inventory || { lowStockThreshold: 10 }), quantity: qty } }
              : p
          )
        );
        setEditingId(null);
      }
    });
  };

  const getStockBadge = (qty: number, threshold: number) => {
    if (qty === 0) return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">Out of stock</span>;
    if (qty <= threshold) return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700">Low stock</span>;
    return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">In stock</span>;
  };

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        <button onClick={() => setFilter('all')} className={`p-4 rounded-lg border text-left transition-colors ${filter === 'all' ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
          <p className="text-2xl font-bold text-gray-900">{products.length}</p>
          <p className="text-sm text-gray-500">Total products</p>
        </button>
        <button onClick={() => setFilter('low')} className={`p-4 rounded-lg border text-left transition-colors ${filter === 'low' ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
          <p className="text-2xl font-bold text-amber-600">{lowCount}</p>
          <p className="text-sm text-gray-500">Low stock</p>
        </button>
        <button onClick={() => setFilter('out')} className={`p-4 rounded-lg border text-left transition-colors ${filter === 'out' ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
          <p className="text-2xl font-bold text-red-600">{outCount}</p>
          <p className="text-sm text-gray-500">Out of stock</p>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                    No products found
                  </td>
                </tr>
              )}
              {filtered.map((product) => {
                const qty = product.inventory?.quantity ?? 0;
                const threshold = product.inventory?.lowStockThreshold ?? 10;
                const isEditing = editingId === product.id;
                const imgSrc = product.images[0]?.thumbnailUrl || product.images[0]?.imageUrl;

                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0 relative">
                          {imgSrc ? (
                            <Image src={imgSrc} alt={product.name} fill className="object-cover" sizes="40px" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-300">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{product.name}</p>
                          {!product.isActive && <span className="text-xs text-gray-400">Inactive</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{product.sku || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{product.category?.name || '—'}</td>
                    <td className="px-4 py-3 text-center">{getStockBadge(qty, threshold)}</td>
                    <td className="px-4 py-3 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          value={editQty}
                          onChange={(e) => setEditQty(e.target.value)}
                          className="w-20 text-center border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSave(product.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                      ) : (
                        <span className={`text-sm font-medium ${qty === 0 ? 'text-red-600' : qty <= threshold ? 'text-amber-600' : 'text-gray-900'}`}>
                          {qty}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleSave(product.id)}
                            disabled={isPending}
                            className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded disabled:opacity-50 flex items-center"
                          >
                            {isPending && <ButtonSpinner />}
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-sm text-gray-600 hover:text-gray-800 px-2 py-1"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingId(product.id); setEditQty(String(qty)); }}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Adjust
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
