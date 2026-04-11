'use client';

import { useState, useOptimistic } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useUpdateCartItem, useRemoveCartItem } from '@/hooks/use-cart';
import { useQueryClient } from '@tanstack/react-query';
import { WISHLIST_COUNT_KEY } from '@/hooks/use-wishlist';
import type { CartItemWithProduct } from '@/features/cart/queries';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/lib/toast';
import { toggleWishlist } from '@/features/wishlist/actions';

interface CartItemsListProps {
  items: CartItemWithProduct[];
  wishlistedIds?: string[];
}

type OptimisticAction =
  | { type: 'update'; itemId: string; quantity: number }
  | { type: 'remove'; itemId: string };

export function CartItemsList({ items: initialItems, wishlistedIds = [] }: CartItemsListProps) {
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [savingItemId, setSavingItemId] = useState<string | null>(null);
  const updateMutation = useUpdateCartItem();
  const removeMutation = useRemoveCartItem();
  const queryClient = useQueryClient();

  const isPending = updateMutation.isPending || removeMutation.isPending;

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

  const handleUpdateQuantity = (itemId: string, oldQuantity: number, newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 99) return;
    setPendingItemId(itemId);
    updateOptimisticItems({ type: 'update', itemId, quantity: newQuantity });

    updateMutation.mutate(
      { cartItemId: itemId, quantity: newQuantity, oldQuantity },
      {
        onSuccess: () => {
          toast.success('Cart updated');
          setPendingItemId(null);
        },
        onError: (error) => {
          toast.error('Could not update quantity', error.message);
          setPendingItemId(null);
        },
      }
    );
  };

  const handleRemove = (itemId: string, itemQuantity: number) => {
    setPendingItemId(itemId);
    updateOptimisticItems({ type: 'remove', itemId });

    removeMutation.mutate(
      { cartItemId: itemId, itemQuantity },
      {
        onSuccess: () => {
          toast.success('Item removed from cart');
          setPendingItemId(null);
        },
        onError: (error) => {
          toast.error('Could not remove item', error.message);
          setPendingItemId(null);
        },
      }
    );
  };

  const handleSaveForLater = async (item: CartItemWithProduct) => {
    setSavingItemId(item.id);
    try {
      const alreadyWishlisted = wishlistedIds.includes(item.product.id);
      if (!alreadyWishlisted) {
        const result = await toggleWishlist(item.product.id);
        if (!result.success) {
          toast.error('Could not save item', result.error || 'Please try again');
          setSavingItemId(null);
          return;
        }
        queryClient.invalidateQueries({ queryKey: [...WISHLIST_COUNT_KEY] });
      }
      // Remove from cart
      updateOptimisticItems({ type: 'remove', itemId: item.id });
      removeMutation.mutate(
        { cartItemId: item.id, itemQuantity: item.quantity },
        {
          onSuccess: () => {
            toast.success('Saved to wishlist', 'Item moved to your wishlist');
            setSavingItemId(null);
          },
          onError: (error) => {
            toast.error('Could not remove from cart', error.message);
            setSavingItemId(null);
          },
        }
      );
    } catch {
      toast.error('Something went wrong');
      setSavingItemId(null);
    }
  };

  return (
    <div>
      {(updateMutation.isError || removeMutation.isError) && (
        <div className="p-4 bg-red-50 border-b border-red-200 text-red-700">
          {updateMutation.error?.message || removeMutation.error?.message}
        </div>
      )}
      <div className="divide-y divide-gray-200">
        {optimisticItems.map((item) => {
          const primaryImage = item.product.images.find(img => img.isPrimary) || item.product.images[0];
          const itemTotal = parseFloat(item.priceAtAdd) * item.quantity;
          const isItemPending = pendingItemId === item.id;
          const isItemSaving = savingItemId === item.id;

          return (
            <div key={item.id} className={`p-4 sm:p-6 transition-opacity ${isItemPending || isItemSaving ? 'opacity-60' : ''}`}>
              <div className="flex gap-3 sm:gap-4">
                {/* Product Image */}
                <Link href={`/products/${item.product.id}`} className="flex-shrink-0">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg overflow-hidden">
                    {primaryImage ? (
                      <Image
                        src={primaryImage.thumbnailUrl || primaryImage.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 80px, 96px"
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
                  <div className="flex justify-between items-start gap-2">
                    <Link
                      href={`/products/${item.product.id}`}
                      className="font-semibold text-gray-900 hover:text-[#2563eb] transition-colors text-sm sm:text-base line-clamp-2"
                    >
                      {item.product.name}
                    </Link>
                    {/* Item Total - desktop */}
                    <p className="hidden sm:block font-semibold text-gray-900 whitespace-nowrap">
                      ${itemTotal.toFixed(2)}
                    </p>
                  </div>

                  <p className="text-sm text-gray-600 mt-0.5">
                    ${parseFloat(item.priceAtAdd).toFixed(2)} each
                  </p>

                  <p className="text-xs text-green-700 mt-1">In Stock</p>

                  {/* Item Total - mobile */}
                  <p className="sm:hidden font-semibold text-gray-900 mt-1">
                    ${itemTotal.toFixed(2)}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3">
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, item.quantity - 1)}
                        disabled={isPending || item.quantity <= 1}
                        className="w-8 h-8 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-600"
                        aria-label="Decrease quantity"
                      >
                        {isItemPending ? <Spinner size="sm" /> : '−'}
                      </button>
                      <span className="w-10 text-center font-medium text-sm border-x border-gray-300 h-8 flex items-center justify-center bg-gray-50">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, item.quantity + 1)}
                        disabled={isPending || item.quantity >= 99}
                        className="w-8 h-8 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-600"
                        aria-label="Increase quantity"
                      >
                        {isItemPending ? <Spinner size="sm" /> : '+'}
                      </button>
                    </div>

                    <span className="text-gray-300 hidden sm:inline">|</span>

                    <button
                      onClick={() => handleRemove(item.id, item.quantity)}
                      disabled={isPending}
                      className="text-[#2563eb] hover:text-[#1d4ed8] hover:underline text-xs sm:text-sm disabled:opacity-50"
                    >
                      Delete
                    </button>

                    <span className="text-gray-300 hidden sm:inline">|</span>

                    <button
                      onClick={() => handleSaveForLater(item)}
                      disabled={isPending || isItemSaving}
                      className="text-[#2563eb] hover:text-[#1d4ed8] hover:underline text-xs sm:text-sm disabled:opacity-50 flex items-center gap-1"
                    >
                      {isItemSaving && <Spinner size="sm" />}
                      Save for later
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
