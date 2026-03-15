'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { addToCart } from '@/features/cart/actions';
import { toast } from '@/lib/toast';

interface FBTProduct {
  id: string;
  name: string;
  price: string;
  discountPrice?: string | null;
  imageUrl?: string;
}

interface FrequentlyBoughtTogetherProps {
  currentProduct: FBTProduct;
  relatedProducts: FBTProduct[];
}

export function FrequentlyBoughtTogether({ currentProduct, relatedProducts }: FrequentlyBoughtTogetherProps) {
  const items = [currentProduct, ...relatedProducts.slice(0, 2)];
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(items.map((p) => [p.id, true]))
  );
  const [isPending, startTransition] = useTransition();

  if (relatedProducts.length === 0) return null;

  const selectedItems = items.filter((p) => checked[p.id]);
  const totalPrice = selectedItems.reduce((sum, p) => sum + Number(p.discountPrice || p.price), 0);

  const handleAddAll = () => {
    startTransition(async () => {
      const results = await Promise.all(
        selectedItems.map((p) => addToCart({ productId: p.id, quantity: 1 }))
      );
      const failed = results.filter((r) => !r.success).length;
      if (failed === 0) {
        toast.success('Added to cart', `${selectedItems.length} items added`);
      } else {
        toast.error('Some items failed', `${failed} of ${selectedItems.length} could not be added`);
      }
    });
  };

  const toggle = (id: string) => {
    if (id === currentProduct.id) return;
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
      <h2 className="text-lg font-bold text-[#0f1111] mb-4">Frequently bought together</h2>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {items.map((product, i) => (
          <div key={product.id} className="flex items-center gap-3">
            {i > 0 && <span className="text-3xl text-gray-400 font-light">+</span>}
            <div className="relative">
              <Link href={`/products/${product.id}`} className="block">
                <div className="w-[120px] h-[120px] bg-gray-50 rounded border border-gray-200 relative overflow-hidden">
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="120px" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Image</div>
                  )}
                </div>
              </Link>
              <label className="absolute -top-2 -left-2 flex items-center">
                <input
                  type="checkbox"
                  checked={checked[product.id] ?? false}
                  onChange={() => toggle(product.id)}
                  disabled={product.id === currentProduct.id}
                  className="w-4 h-4 accent-[#2563eb] rounded"
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Item names + prices */}
      <div className="space-y-1 mb-4 text-sm">
        {items.map((product, i) => (
          <div key={product.id} className="flex items-center gap-2">
            <span className={checked[product.id] ? 'text-[#0f1111]' : 'text-gray-400 line-through'}>
              {i === 0 ? 'This item: ' : ''}{product.name.length > 50 ? product.name.slice(0, 50) + '...' : product.name}
            </span>
            <span className={`font-medium ${checked[product.id] ? 'text-[#0f1111]' : 'text-gray-400'}`}>
              ${Number(product.discountPrice || product.price).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm">
          Total price: <span className="font-bold text-[#0f1111] text-base">${totalPrice.toFixed(2)}</span>
        </div>
        <button
          onClick={handleAddAll}
          disabled={isPending || selectedItems.length === 0}
          className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium px-5 py-2 rounded-full transition-colors disabled:opacity-50"
        >
          {isPending ? 'Adding...' : `Add all ${selectedItems.length} to Cart`}
        </button>
      </div>
    </div>
  );
}
