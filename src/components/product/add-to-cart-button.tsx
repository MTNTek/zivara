'use client';

import { useState, useTransition } from 'react';
import { addToCart } from '@/features/cart/actions';
import { useRouter } from 'next/navigation';
import { ButtonSpinner } from '@/components/ui/spinner';
import { toast } from '@/lib/toast';

interface AddToCartButtonProps {
  productId: string;
  isInStock: boolean;
  maxQuantity: number;
}

export function AddToCartButton({ productId, isInStock, maxQuantity }: AddToCartButtonProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAddToCart = async () => {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await addToCart({ productId, quantity });
      
      if (result.success) {
        setSuccess(true);
        toast.success('Added to cart', `${quantity} item${quantity > 1 ? 's' : ''} added successfully`);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errorMsg = result.error?.message || result.error || 'Failed to add to cart';
        setError(errorMsg);
        toast.error('Could not add to cart', errorMsg);
      }
    });
  };

  const handleBuyNow = async () => {
    setError(null);

    startTransition(async () => {
      const result = await addToCart({ productId, quantity });
      
      if (result.success) {
        router.push('/cart');
      } else {
        const errorMsg = result.error?.message || result.error || 'Failed to add to cart';
        setError(errorMsg);
        toast.error('Could not add to cart', errorMsg);
      }
    });
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
            disabled={isPending || quantity <= 1}
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
            className="w-20 text-center border border-gray-300 rounded-md py-3 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 text-lg"
            disabled={isPending}
            aria-label="Product quantity"
          />
          <button
            onClick={() => setQuantity(Math.min(Math.min(maxQuantity, 99), quantity + 1))}
            className="w-12 h-12 min-w-[44px] min-h-[44px] border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isPending || quantity >= Math.min(maxQuantity, 99)}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert" aria-live="assertive">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg" role="status" aria-live="polite">
          Added to cart successfully!
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleAddToCart}
          disabled={isPending}
          className="flex-1 bg-teal-600 text-white px-6 py-3 min-h-[44px] rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          aria-label={isPending ? 'Adding to cart' : 'Add to cart'}
        >
          {isPending && <ButtonSpinner />}
          {isPending ? 'Adding...' : 'Add to Cart'}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={isPending}
          className="flex-1 bg-gray-900 text-white px-6 py-3 min-h-[44px] rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2"
          aria-label={isPending ? 'Processing purchase' : 'Buy now'}
        >
          {isPending && <ButtonSpinner />}
          {isPending ? 'Processing...' : 'Buy Now'}
        </button>
      </div>
    </div>
  );
}
