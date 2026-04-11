'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addToCart, updateCartItemQuantity, removeFromCart } from '@/features/cart/actions';

export const CART_COUNT_KEY = ['cart', 'count'] as const;

async function fetchCartCount(): Promise<number> {
  const res = await fetch('/api/cart/count');
  if (!res.ok) return 0;
  const data = await res.json();
  return data.count ?? 0;
}

export function useCartCount() {
  return useQuery({
    queryKey: CART_COUNT_KEY,
    queryFn: fetchCartCount,
    initialData: 0,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { productId: string; quantity: number }) => {
      const result = await addToCart(input);
      if (!result.success) {
        throw new Error(
          typeof result.error === 'string'
            ? result.error
            : result.error?.message || 'Failed to add to cart'
        );
      }
      return result;
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: CART_COUNT_KEY });
      // Snapshot previous value
      const previous = queryClient.getQueryData<number>(CART_COUNT_KEY) ?? 0;
      // Optimistically increment
      queryClient.setQueryData<number>(CART_COUNT_KEY, previous + variables.quantity);
      return { previous };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previous !== undefined) {
        queryClient.setQueryData<number>(CART_COUNT_KEY, context.previous);
      }
    },
    onSettled: () => {
      // Refetch to get the real count
      queryClient.invalidateQueries({ queryKey: CART_COUNT_KEY });
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { cartItemId: string; quantity: number; oldQuantity: number }) => {
      const result = await updateCartItemQuantity({
        cartItemId: input.cartItemId,
        quantity: input.quantity,
      });
      if (!result.success) {
        throw new Error(
          typeof result.error === 'string'
            ? result.error
            : result.error?.message || 'Failed to update quantity'
        );
      }
      return result;
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: CART_COUNT_KEY });
      const previous = queryClient.getQueryData<number>(CART_COUNT_KEY) ?? 0;
      const diff = variables.quantity - variables.oldQuantity;
      queryClient.setQueryData<number>(CART_COUNT_KEY, Math.max(0, previous + diff));
      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData<number>(CART_COUNT_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_COUNT_KEY });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { cartItemId: string; itemQuantity: number }) => {
      const result = await removeFromCart({ cartItemId: input.cartItemId });
      if (!result.success) {
        throw new Error(
          typeof result.error === 'string'
            ? result.error
            : result.error?.message || 'Failed to remove item'
        );
      }
      return result;
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: CART_COUNT_KEY });
      const previous = queryClient.getQueryData<number>(CART_COUNT_KEY) ?? 0;
      queryClient.setQueryData<number>(CART_COUNT_KEY, Math.max(0, previous - variables.itemQuantity));
      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData<number>(CART_COUNT_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_COUNT_KEY });
    },
  });
}
