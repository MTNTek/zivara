import { getProducts } from '@/features/products/cached-queries';
import { ProductCard } from '@/components/product/ProductCard';

interface CartRecommendationsProps {
  excludeIds: string[];
}

export async function CartRecommendations({ excludeIds }: CartRecommendationsProps) {
  const { products } = await getProducts({ limit: 20, sortBy: 'rating' });

  const recommended = products
    .filter((p) => !excludeIds.includes(p.id))
    .slice(0, 6);

  if (recommended.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-[21px] font-bold text-[#0f1111] mb-4">You Might Also Like</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-5">
        {recommended.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            discountPrice={product.discountPrice}
            imageUrl={product.images?.[0]?.imageUrl}
            averageRating={product.averageRating}
            reviewCount={product.reviewCount || 0}
            stock={product.inventory?.quantity ?? 0}
          />
        ))}
      </div>
    </div>
  );
}
