import Link from 'next/link';
import Image from 'next/image';
import type { Product, ProductImage } from '@/types';

interface ProductWithImages extends Product {
  images?: ProductImage[];
}

interface ProductGridProps {
  products: ProductWithImages[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => {
        const isOutOfStock = product.inventory && product.inventory.quantity === 0;
        const discountPercentage = product.discountPrice 
          ? Math.round(((Number(product.price) - Number(product.discountPrice)) / Number(product.price)) * 100)
          : 0;
        
        return (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group"
            aria-label={`View ${product.name}${isOutOfStock ? ' (Out of stock)' : ''}`}
          >
            <article className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden h-full flex flex-col">
              {/* Product Image */}
              <div className="relative w-full h-64 bg-gray-100">
                {product.images?.[0] ? (
                  <Image
                    src={product.images[0].imageUrl}
                    alt={product.images[0].altText || product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400" role="img" aria-label="No product image available">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                {/* Discount Badge */}
                {product.discountPrice && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold" aria-label={`${discountPercentage}% discount`}>
                    {discountPercentage}% OFF
                  </div>
                )}

                {/* Out of Stock Badge */}
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors flex-1">
                  {product.name}
                </h3>
                
                {/* Rating */}
                {product.averageRating && Number(product.averageRating) > 0 && (
                  <div className="flex items-center gap-1 mb-2" role="img" aria-label={`Rated ${Number(product.averageRating).toFixed(1)} out of 5 stars with ${product.reviewCount || 0} reviews`}>
                    <div className="flex" aria-hidden="true">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={i < Math.round(Number(product.averageRating)) ? 'text-yellow-400' : 'text-gray-300'}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      ({product.reviewCount || 0})
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center justify-between mt-auto">
                  <div>
                    {product.discountPrice ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-teal-600" aria-label={`Sale price $${Number(product.discountPrice).toFixed(2)}`}>
                          ${Number(product.discountPrice).toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500 line-through" aria-label={`Original price $${Number(product.price).toFixed(2)}`}>
                          ${Number(product.price).toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-gray-900" aria-label={`Price $${Number(product.price).toFixed(2)}`}>
                        ${Number(product.price).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </article>
          </Link>
        );
      })}
    </div>
  );
}
