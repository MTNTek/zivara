'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const [justAdded, setJustAdded] = useState(false);
  const addToCart = useAddToCart();
  const router = useRouter();

  const handleAddToCart = () => {
    setJustAdded(false);

    addToCart.mutate(
      { productId, quantity },
      {
        onSuccess: () => {
          setJustAdded(true);
          toast.success('Added to cart', `${quantity} item${quantity > 1 ? 's' : ''} added successfully`);
          setTimeout(() => setJustAdded(false), 3000);
        },
        onError: (error) => {
          toast.error('Could not add to cart', error.message);
        },
      }
    );
  };

  const handleBuyNow = () => {
    addToCart.mutate(
      { productId, quantity },
      {
        onSuccess: () => {
          router.push('/checkout');
        },
        onError: (error) => {
          toast.error('Could not proceed', error.message);
        },
      }
    );
  };

  if (!isInStock) {
    return (
      <div className="space-y-3">
        <button
          disabled
          className="w-full bg-gray-300 text-gray-600 px-6 py-3 rounded-full font-semibold cursor-not-allowed text-sm"
          aria-label="Product is out of stock"
        >
          Out of Stock
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Quantity Selector */}
      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1.5">
          Qty:
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-9 h-9 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={addToCart.isPending || quantity <= 1}
            aria-label="Decrease quantity"
          >
            −
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
            className="w-14 text-center border border-gray-300 rounded-md py-2 focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-sm"
            disabled={addToCart.isPending}
            aria-label="Product quantity"
          />
          <button
            onClick={() => setQuantity(Math.min(Math.min(maxQuantity, 99), quantity + 1))}
            className="w-9 h-9 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={addToCart.isPending || quantity >= Math.min(maxQuantity, 99)}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Error Message */}
      {addToCart.isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm" role="alert" aria-live="assertive">
          {addToCart.error.message}
        </div>
      )}

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={addToCart.isPending}
        className={`w-full px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          justAdded
            ? 'bg-green-500 text-white focus:ring-green-500'
            : 'bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0F1111] border border-[#FCD200] focus:ring-[#f59e0b]'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label={addToCart.isPending ? 'Adding to cart' : justAdded ? 'Added to cart' : 'Add to cart'}
      >
        {addToCart.isPending ? (
          <>
            <ButtonSpinner />
            Adding...
          </>
        ) : justAdded ? (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Added to Cart
          </>
        ) : (
          'Add to Cart'
        )}
      </button>

      {/* Buy Now Button */}
      <button
        onClick={handleBuyNow}
        disabled={addToCart.isPending}
        className="w-full bg-[#FFA41C] hover:bg-[#FA8900] text-[#0F1111] px-4 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#FFA41C] focus:ring-offset-2"
        aria-label="Buy now"
      >
        Buy Now
      </button>

      {/* Trust line */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-[#565959]">
        <svg className="w-3.5 h-3.5 text-[#007600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>Secure transaction</span>
      </div>
    </div>
  );
}