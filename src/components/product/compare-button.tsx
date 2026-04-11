'use client';

import { useCompare, type CompareProduct } from '@/hooks/use-compare';
import { toast } from '@/lib/toast';

interface CompareButtonProps {
  product: CompareProduct;
  className?: string;
}

export function CompareButton({ product, className = '' }: CompareButtonProps) {
  const { add, remove, has, isFull } = useCompare();
  const isAdded = has(product.id);

  const handleClick = () => {
    if (isAdded) {
      remove(product.id);
      toast.info('Removed from comparison');
    } else if (isFull) {
      toast.error('Compare limit reached', 'Remove a product first (max 4)');
    } else {
      add(product);
      toast.success('Added to comparison');
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1 text-xs transition-colors ${
        isAdded
          ? 'text-[#2563eb] font-medium'
          : 'text-[#565959] hover:text-[#2563eb]'
      } ${className}`}
      title={isAdded ? 'Remove from compare' : 'Add to compare'}
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      {isAdded ? 'Comparing' : 'Compare'}
    </button>
  );
}
