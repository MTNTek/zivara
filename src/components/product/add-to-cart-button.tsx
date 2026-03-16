'use client';

import { useState } from 'react';
import { useAddToCart } from '@/hooks/use-cart';
import { ButtonSpinner } from '@/components/ui/spinner';
import { toast } from '@/lib/toast';

interface AddToCartButtonProps {
  productId: string;
  isInStock: boolean;
  maxQuantity: number;
}

export function AddToCartButton({ productId, isInStock, maxQuantity }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [success, setSuccess] = useState(false);
  const addToCart = useAddToCart();

  const handleAddToCart = () => {
    setSuccess(false);

    addToCart.mutate(
      { productId, quantity },
      {
        onSuccess: () => {
          setSuccess(true);
          toast.success('Added to cart', `${quantity} item${quantity > 1 ? 's' : ''} added successfully`);
          setTimeout(() => setSuccess(false), 3000);
        },
        onError: (error) => {
          toast.error('Could not add to cart', error.message);
        },
      }
    );
  };

  if (!isInStock) {
    return (
      <div className="space-y-4">
        <button
          disabled
          className="w-full bg-gray-300 text-gray-600 px-6 py-3 rounded-lg font-semibold cursor-not-allowed"
          aria-label="Product is out of stock"
        >
          Out of Stock
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
          Quantity
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-12 h-12 min-w-[44px] min-h-[44px] border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={addToCart.isPending || quantity <= 1}
            aria-label="Decrease quantity"
          >
            -
          </button>
          <input
            id="quantity"
            type="number"
            min="1"
            max={Math.min(maxQuantity, 99)}
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val) && val >= 1 && val <= Math.min(maxQuantity, 99)) {
                setQuantity(val);
              }
            }}
            className="w-20 text-center border border-gray-300 rounded-md py-3 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#0F52BA] focus:ring-offset-2 text-lg"
            disabled={addToCart.isPending}
            aria-label="Product quantity"
          />
          <button
            onClick={() => setQuantity(Math.min(Math.min(maxQuantity, 99), quantity + 1))}
            className="w-12 h-12 min-w-[44px] min-h-[44px] border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={addToCart.isPending || quantity >= Math.min(maxQuantity, 99)}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Error Message */}
      {addToCart.isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert" aria-live="assertive">
          {addToCart.error.message}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg" role="status" aria-live="polite">
          Added to cart successfully!
        </div>
      )}

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={addToCart.isPending}
        className="max-w-[260px] bg-[#2563eb] text-white px-4 py-1.5 rounded-full text-xs font-medium hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label={addToCart.isPending ? 'Adding to cart' : 'Add to cart'}
      >
        {addToCart.isPending && <ButtonSpinner />}
        {addToCart.isPending ? 'Adding...' : 'Add to Cart'}
      </button>
    </div>
  );
}
