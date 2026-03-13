import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getProductById } from '@/features/products/cached-queries';
import { getReviewsByProduct } from '@/features/reviews/queries';
import { ProductImageGallery } from '@/components/product/product-image-gallery';
import { AddToCartButton } from '@/components/product/add-to-cart-button';
import { ProductReviews } from '@/components/product/product-reviews';
import { ReviewForm } from '@/components/product/review-form';
import { WishlistButton } from '@/components/product/wishlist-button';
import { TrackView } from '@/components/product/track-view';
import { RecentlyViewed } from '@/components/product/recently-viewed';
import { RelatedProducts } from '@/components/product/related-products';
import { getSession } from '@/lib/auth';
import { getWishlistProductIds } from '@/features/wishlist/actions';
import Link from 'next/link';

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return { title: 'Product Not Found - Zivara' };
  }

  const price = product.discountPrice || product.price;
  const image = product.images?.find((img) => img.isPrimary) || product.images?.[0];

  return {
    title: `${product.name} - Zivara`,
    description: product.description?.slice(0, 160) || `Shop ${product.name} at Zivara`,
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160),
      images: image ? [{ url: image.imageUrl, alt: product.name }] : [],
      type: 'website',
    },
    other: {
      'product:price:amount': Number(price).toFixed(2),
      'product:price:currency': 'USD',
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const { reviews, pagination } = await getReviewsByProduct(product.id, {
    page: 1,
    limit: 10,
  });
  const totalReviews = pagination.total;

  const session = await getSession();
  const wishlistIds = session ? await getWishlistProductIds() : [];
  const isWishlisted = wishlistIds.includes(product.id);
  const isInStock = !!(product.inventory && product.inventory.quantity > 0);
  const isLowStock = product.inventory && product.inventory.quantity > 0 && 
                     product.inventory.quantity <= product.inventory.lowStockThreshold;

  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];

  return (
    <div className="min-h-screen bg-white">
      <TrackView
        id={product.id}
        name={product.name}
        price={product.price}
        discountPrice={product.discountPrice}
        imageUrl={primaryImage?.imageUrl}
      />
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center space-x-2 text-gray-600">
            <li>
              <Link href="/" className="hover:text-teal-600">Home</Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/products" className="hover:text-teal-600">Products</Link>
            </li>
            <li>/</li>
            <li>
              <Link 
                href={`/products/category/${product.category.slug}`}
                className="hover:text-teal-600"
              >
                {product.category.name}
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div>
            <ProductImageGallery 
              images={product.images || []} 
              productName={product.name}
            />
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between gap-2 mb-4">
              <h1 className="text-3xl font-bold text-gray-900">
                {product.name}
              </h1>
              <WishlistButton productId={product.id} initialWishlisted={isWishlisted} size="md" />
            </div>

            {/* Rating */}
            {product.averageRating && Number(product.averageRating) > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={i < Math.round(Number(product.averageRating)) ? 'text-yellow-400 text-xl' : 'text-gray-300 text-xl'}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-gray-600">
                  {Number(product.averageRating).toFixed(1)} ({product.reviewCount || 0} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="mb-6">
              {product.discountPrice ? (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl font-bold text-teal-600">
                      ${Number(product.discountPrice).toFixed(2)}
                    </span>
                    <span className="text-xl text-gray-500 line-through">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                      {Math.round(((Number(product.price) - Number(product.discountPrice)) / Number(product.price)) * 100)}% OFF
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-3xl font-bold text-gray-900">
                  ${Number(product.price).toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {isInStock ? (
                <div>
                  <span className="text-green-600 font-semibold">In Stock</span>
                  {isLowStock && (
                    <span className="ml-2 text-orange-600 text-sm">
                      (Only {product.inventory?.quantity} left!)
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-red-600 font-semibold">Out of Stock</span>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
            </div>

            {/* SKU */}
            {product.sku && (
              <div className="mb-6 text-sm text-gray-600">
                SKU: {product.sku}
              </div>
            )}

            {/* Add to Cart */}
            <AddToCartButton 
              productId={product.id}
              isInStock={isInStock}
              maxQuantity={product.inventory?.quantity || 0}
            />
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Customer Reviews
          </h2>
          <ProductReviews 
            productId={product.id}
            reviews={reviews}
            totalReviews={totalReviews}
            averageRating={product.averageRating ? Number(product.averageRating) : 0}
          />
        </div>

        {/* Write a Review */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Write a Review</h2>
          {session ? (
            <ReviewForm productId={product.id} />
          ) : (
            <p className="text-gray-600">
              <Link href="/login" className="text-teal-600 hover:text-teal-700 font-semibold">
                Sign in
              </Link>{' '}
              to leave a review.
            </p>
          )}
        </div>

        {/* Related Products */}
        <Suspense fallback={null}>
          <RelatedProducts productId={product.id} categoryId={product.categoryId} />
        </Suspense>

        {/* Recently Viewed */}
        <RecentlyViewed excludeId={product.id} />
      </div>
    </div>
  );
}
