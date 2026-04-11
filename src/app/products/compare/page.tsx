import type { Metadata } from 'next';
import { db } from '@/db';
import { products } from '@/db/schema';
import { inArray } from 'drizzle-orm';
import Image from 'next/image';
import Link from 'next/link';
import { AddToCartButton } from '@/components/product/add-to-cart-button';

export const metadata: Metadata = {
  title: 'Compare Products - Zivara',
  description: 'Compare products side by side.',
};

interface ComparePageProps {
  searchParams: Promise<{ ids?: string }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const { ids } = await searchParams;
  const productIds = ids?.split(',').filter(Boolean).slice(0, 4) || [];

  if (productIds.length < 2) {
    return (
      <div className="min-h-screen bg-[#EAEDED] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-[#0f1111] mb-2">Select at least 2 products to compare</h1>
          <Link href="/products" className="text-[#2563eb] hover:underline text-sm">
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  const items = await db.query.products.findMany({
    where: inArray(products.id, productIds),
    with: { images: { limit: 1 }, inventory: true, category: true },
  });

  if (items.length < 2) {
    return (
      <div className="min-h-screen bg-[#EAEDED] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-[#0f1111] mb-2">Products not found</h1>
          <Link href="/products" className="text-[#2563eb] hover:underline text-sm">
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="px-4 sm:px-6 lg:px-10 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#0F1111]">Compare Products</h1>
          <Link href="/products" className="text-sm text-[#2563eb] hover:underline">
            ← Continue shopping
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr>
                <th className="p-4 text-left text-sm font-medium text-[#565959] w-32 bg-gray-50" />
                {items.map(item => (
                  <th key={item.id} className="p-4 text-center align-top" style={{ width: `${100 / items.length}%` }}>
                    <Link href={`/products/${item.id}`} className="group block">
                      <div className="relative w-32 h-32 mx-auto mb-3 bg-gray-50 rounded overflow-hidden">
                        {item.images?.[0] ? (
                          <Image
                            src={item.images[0].imageUrl}
                            alt={item.name}
                            fill
                            className="object-contain p-2"
                            sizes="128px"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-300 text-xs">No image</div>
                        )}
                      </div>
                      <p className="text-sm text-[#2563eb] group-hover:text-[#1d4ed8] group-hover:underline line-clamp-2">
                        {item.name}
                      </p>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <CompareRow label="Price">
                {items.map(item => {
                  const price = Number(item.discountPrice || item.price);
                  const hasDiscount = !!item.discountPrice;
                  const savings = hasDiscount ? Number(item.price) - Number(item.discountPrice) : 0;
                  const savingsPct = hasDiscount ? Math.round((savings / Number(item.price)) * 100) : 0;
                  return (
                    <td key={item.id} className="p-4 text-center">
                      <span className="text-lg font-bold text-[#B12704]">${price.toFixed(2)}</span>
                      {hasDiscount && (
                        <>
                          <span className="block text-xs text-[#565959] line-through">${Number(item.price).toFixed(2)}</span>
                          <span className="block text-xs text-[#CC0C39] font-medium mt-0.5">
                            Save ${savings.toFixed(2)} ({savingsPct}%)
                          </span>
                        </>
                      )}
                    </td>
                  );
                })}
              </CompareRow>
              <CompareRow label="Category">
                {items.map(item => (
                  <td key={item.id} className="p-4 text-center text-sm text-[#0f1111]">
                    {item.category.name}
                  </td>
                ))}
              </CompareRow>
              <CompareRow label="Description">
                {items.map(item => (
                  <td key={item.id} className="p-4 text-sm text-[#565959] align-top">
                    <p className="line-clamp-4 text-left">{item.description || '—'}</p>
                  </td>
                ))}
              </CompareRow>
              <CompareRow label="Availability">
                {items.map(item => {
                  const inStock = item.inventory && item.inventory.quantity > 0;
                  const lowStock = item.inventory && item.inventory.quantity > 0 && item.inventory.quantity <= 5;
                  return (
                    <td key={item.id} className="p-4 text-center text-sm">
                      <span className={inStock ? (lowStock ? 'text-orange-600' : 'text-[#007600]') : 'text-red-600'}>
                        {!inStock ? 'Out of Stock' : lowStock ? `Only ${item.inventory!.quantity} left` : 'In Stock'}
                      </span>
                      {inStock && (
                        <span className="block text-xs text-[#565959] mt-0.5">FREE delivery</span>
                      )}
                    </td>
                  );
                })}
              </CompareRow>
              <CompareRow label="Rating">
                {items.map(item => (
                  <td key={item.id} className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <div className="flex text-[#de7921]">
                        {[1, 2, 3, 4, 5].map(s => (
                          <svg key={s} className="w-3.5 h-3.5" fill={s <= Math.round(Number(item.averageRating || 0)) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-[#565959]">({item.reviewCount || 0})</span>
                    </div>
                  </td>
                ))}
              </CompareRow>
              <CompareRow label="">
                {items.map(item => {
                  const inStock = !!(item.inventory && item.inventory.quantity > 0);
                  return (
                    <td key={item.id} className="p-4 text-center">
                      <AddToCartButton
                        productId={item.id}
                        isInStock={inStock}
                        maxQuantity={item.inventory?.quantity || 0}
                      />
                    </td>
                  );
                })}
              </CompareRow>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CompareRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr>
      <td className="p-4 text-sm font-medium text-[#565959] bg-gray-50 whitespace-nowrap">{label}</td>
      {children}
    </tr>
  );
}
