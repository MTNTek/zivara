'use client';

import { useState, useTransition } from 'react';
import { bulkUpdateProducts } from '@/features/products/actions';
import type { Product, Category } from '@/types';

interface ProductListActionsProps {
  products: Product[];
  categories: Category[];
}

export function ProductListActions({ products, categories }: ProductListActionsProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle select all checkbox
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProducts(products.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  // Handle individual checkbox
  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  // Bulk activate products
  const handleBulkActivate = () => {
    if (selectedProducts.length === 0) return;

    startTransition(async () => {
      setError(null);
      setSuccess(null);
      
      const result = await bulkUpdateProducts(selectedProducts, { isActive: true });
      
      if (result.success) {
        setSuccess(`Successfully activated ${result.data?.updated ?? 0} products`);
        setSelectedProducts([]);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(typeof result.error === 'string' ? result.error : ((result.error as unknown as Record<string, string>)?.message || 'Failed to activate products'));
      }
    });
  };

  // Bulk deactivate products
  const handleBulkDeactivate = () => {
    if (selectedProducts.length === 0) return;

    startTransition(async () => {
      setError(null);
      setSuccess(null);
      
      const result = await bulkUpdateProducts(selectedProducts, { isActive: false });
      
      if (result.success) {
        setSuccess(`Successfully deactivated ${result.data?.updated ?? 0} products`);
        setSelectedProducts([]);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(typeof result.error === 'string' ? result.error : ((result.error as unknown as Record<string, string>)?.message || 'Failed to deactivate products'));
      }
    });
  };

  // Bulk assign category
  const handleBulkAssignCategory = (categoryId: string) => {
    if (selectedProducts.length === 0 || !categoryId) return;

    startTransition(async () => {
      setError(null);
      setSuccess(null);
      
      const result = await bulkUpdateProducts(selectedProducts, { categoryId });
      
      if (result.success) {
        setSuccess(`Successfully updated category for ${result.data?.updated ?? 0} products`);
        setSelectedProducts([]);
        setShowBulkActions(false);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(typeof result.error === 'string' ? result.error : ((result.error as unknown as Record<string, string>)?.message || 'Failed to update category'));
      }
    });
  };

  // Set up event listeners for checkboxes
  if (typeof window !== 'undefined') {
    // Handle select all
    const selectAllCheckbox = document.getElementById('select-all') as HTMLInputElement | null;
    if (selectAllCheckbox) {
      selectAllCheckbox.checked = selectedProducts.length === products.length && products.length > 0;
      selectAllCheckbox.indeterminate = selectedProducts.length > 0 && selectedProducts.length < products.length;
      selectAllCheckbox.onchange = handleSelectAll as unknown as (this: GlobalEventHandlers, ev: Event) => void;
    }

    // Handle individual checkboxes
    document.querySelectorAll<HTMLInputElement>('.product-checkbox').forEach((input) => {
      const productId = input.dataset.productId;
      if (productId) {
        input.checked = selectedProducts.includes(productId);
        input.onchange = (e) => handleSelectProduct(productId, (e.target as HTMLInputElement).checked);
      }
    });
  }

  return (
    <>
      {/* Notifications */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedProducts.length > 0 && (
        <div className="mb-4 bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">
                {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={handleBulkActivate}
                disabled={isPending}
                className="text-sm text-black hover:text-blue-800 font-medium disabled:opacity-50"
              >
                Activate
              </button>
              <button
                onClick={handleBulkDeactivate}
                disabled={isPending}
                className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
              >
                Deactivate
              </button>
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                disabled={isPending}
                className="text-sm text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50"
              >
                Assign Category
              </button>
            </div>
            <button
              onClick={() => setSelectedProducts([])}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear selection
            </button>
          </div>

          {/* Category Assignment Dropdown */}
          {showBulkActions && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label htmlFor="bulk-category" className="block text-sm font-medium text-gray-700 mb-2">
                Select category to assign:
              </label>
              <div className="flex items-center space-x-2">
                <select
                  id="bulk-category"
                  onChange={(e) => handleBulkAssignCategory(e.target.value)}
                  disabled={isPending}
                  className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-blue-800 focus:ring-[#0F52BA] sm:text-sm disabled:opacity-50"
                  defaultValue=""
                >
                  <option value="">Choose a category...</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowBulkActions(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
