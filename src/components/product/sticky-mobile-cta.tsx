'use client';

import { useAddToCart } from '@/hooks/use-cart';
import { toast } from '@/lib/toast';
import { ButtonSpinner } from '@/components/ui/spinner';

interface StickyMobileCTAProps {
  productId: string;
  price: string;
  discountPrice?: string | null;
  isInStock: boolean;
  productName: string;
}

export function StickyMobileCTA({ productId, price, discountPrice, isInStock, productName }: StickyMobileCTAProps) {
  const addToCart = useAddToCart();
  const displayPrice = discountPrice || price;

  const handleAdd = () => {
    addToCart.mutate(
      { productId, quantity: 1 },
      {
        onSuccess: () => toast.success('Added to cart', `${productName} added`),
        onError: (err) => toast.error('Error', err.message),
      }
    );
  };

  if (!isInStock) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] p-3 lg:hidden">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#565959] truncate">{productName}</p>
          <p className="text-lg font-medium text-[#0f1111]">${Number(displayPrice).toFixed(2)}</p>
        </div>
        <button
          onClick={handleAdd}
          disabled={addToCart.isPending}
          className="flex-shrink-0 bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0F1111] px-6 py-2.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          {addToCart.isPending ? <><ButtonSpinner /> Adding...</> : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
