'use client';

import { useState, useTransition, useOptimistic } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { updateCartItemQuantity, removeFromCart } from '@/features/cart/actions';
import type { CartItemWithProduct } from '@/features/cart/queries';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/lib/toast';

interface CartItemsListProps {
  items: CartItemWithProduct[];
}

type OptimisticAction = 
  | { type: 'update'; itemId: string; quantity: number }
  | { type: 'remove'; itemId: string };

export function CartItemsList({ items: initialItems }: CartItemsListProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);

  // Use optimistic updates for immediate UI feedback
  const [optimisticItems, updateOptimisticItems] = useOptimistic(
    initialItems,
    (state, action: OptimisticAction) => {
      if (action.type === 'update') {
        return state.map(item =>
          item.id === action.itemId ? { ...item, quantity: action.quantity } : item
        );
      } else if (action.type === 'remove') {
        return state.filter(item => item.id !== action.itemId);
      }
      return state;
    }
  );

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 99) return;

    setPendingItemId(itemId);
    setError(null);

    // Optimistic update
    updateOptimisticItems({ type: 'update', itemId, quantity: newQuantity });

    startTransition(async () => {
      const result = await updateCartItemQuantity({ cartItemId: itemId, quantity: newQuantity });
      if (!result.success) {
        const errorMsg = result.error?.message || result.error || 'Failed to update quantity';
        setError(errorMsg);
        toast.error('Could not update quantity', errorMsg);
      } else {
        toast.success('Cart updated');
      }
      setPendingItemId(null);
    });
  };

  const handleRemove = (itemId: string) => {
    setPendingItemId(itemId);
    setError(null);

    // Optimistic update
    updateOptimisticItems({ type: 'remove', itemId });

    startTransition(async () => {
      const result = await removeFromCart({ cartItemId: itemId });
      if (!result.success) {
        const errorMsg = result.error?.message || result.error || 'Failed to remove item';
        setError(errorMsg);
        toast.error('Could not remove item', errorMsg);
      } else {
        toast.success('Item removed from cart');
      }
      setPendingItemId(null);
    });
  };

  return (
    <div>
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200 text-red-700">
          {error}
        </div>
      )}
      <div className="divide-y divide-gray-200">
        {optimisticItems.map((item) => {
          const primaryImage = item.product.images.find(img => img.isPrimary) || item.product.images[0];
          const itemTotal = parseFloat(item.priceAtAdd) * item.quantity;
          const isItemPending = pendingItemId === item.id;

          return (
            <div key={item.id} className={`p-6 ${isItemPending ? 'opacity-60' : ''}`}>
              <div className="flex gap-4">
                {/* Product Image */}
                <Link href={`/products/${item.product.id}`} className="flex-shrink-0">
                  <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                    {primaryImage ? (
                      <Image
                        src={primaryImage.thumbnailUrl || primaryImage.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <Link 
                    href={`/products/${item.product.id}`}
                    className="font-semibold text-gray-900 hover:text-teal-600 transition-colors"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-gray-600 mt-1">
                    ${parseFloat(item.priceAtAdd).toFixed(2)} each
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      disabled={isPending || item.quantity <= 1}
                      className="w-8 h-8 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isItemPending ? <Spinner size="sm" /> : '-'}
                    </button>
                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      disabled={isPending || item.quantity >= 99}
                      className="w-8 h-8 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isItemPending ? <Spinner size="sm" /> : '+'}
                    </button>
                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={isPending}
                      className="ml-4 text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50 flex items-center gap-1"
                    >
                      {isItemPending && <Spinner size="sm" />}
                      Remove
                    </button>
                  </div>
                </div>

                {/* Item Total */}
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ${itemTotal.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
