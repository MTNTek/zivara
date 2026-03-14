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
import { ShareButton } from '@/components/product/share-button';
import { TrackView } from '@/components/product/track-view';
import { RecentlyViewed } from '@/components/product/recently-viewed';
import { FrequentlyBoughtTogether } from '@/components/product/frequently-bought-together';
import { getSession } from '@/lib/auth';
import { getWishlistProductIds } from '@/features/wishlist/actions';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq, ne, and, sql } from 'drizzle-orm';
import Link from 'next/link';
import Image from 'next/image';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return { title: 'Product Not Found - Zivara' };
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
  if (!product) notFound();

  const { reviews, pagination } = await getReviewsByProduct(product.id, { page: 1, limit: 10 });
  const totalReviews = pagination.total;

  const session = await getSession();
  const wishlistIds = session ? await getWishlistProductIds() : [];
  const isWishlisted = wishlistIds.includes(product.id);
  const isInStock = !!(product.inventory && product.inventory.quantity > 0);
  const isLowStock = product.inventory && product.inventory.quantity > 0 &&
    product.inventory.quantity <= product.inventory.lowStockThreshold;
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];

  // Fetch related products for "Frequently Bought Together"
  const relatedForFBT = await db.query.products.findMany({
    where: and(
      eq(products.categoryId, product.categoryId),
      ne(products.id, product.id),
      eq(products.isActive, true),
    ),
    with: { images: { limit: 1 }, inventory: true },
    orderBy: sql`RANDOM()`,
    limit: 5,
  });

  const fbtProducts = relatedForFBT.slice(0, 2).map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    discountPrice: p.discountPrice,
    imageUrl: p.images?.[0]?.imageUrl,
  }));

  const currentFBT = {
    id: product.id,
    name: product.name,
    price: product.price,
    discountPrice: product.discountPrice,
    imageUrl: primaryImage?.imageUrl,
  };

  const discountPct = product.discountPrice
    ? Math.round(((Number(product.price) - Number(product.discountPrice)) / Number(product.price)) * 100)
    : 0;

  const rating = product.averageRating ? Number(product.averageRating) : 0;

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <TrackView
        id={product.id}
        name={product.name}
        price={product.price}
        discountPrice={product.discountPrice}
        imageUrl={primaryImage?.imageUrl}
      />

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <nav className="container mx-auto px-4 py-2 text-xs text-[#007185]">
          <ol className="flex items-center gap-1 flex-wrap">
            <li><Link href="/" className="hover:text-[#c7511f] hover:underline">Home</Link></li>
            <li className="text-gray-400">›</li>
            <li><Link href="/products" className="hover:text-[#c7511f] hover:underline">Products</Link></li>
            <li className="text-gray-400">›</li>
            <li>
              <Link href={`/products/category/${product.category.slug}`} className="hover:text-[#c7511f] hover:underline">
                {product.category.name}
              </Link>
            </li>
            <li className="text-gray-400">›</li>
            <li className="text-gray-600">{product.name}</li>
          </ol>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Main product section: 3-column Amazon layout */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left: Image gallery */}
            <div className="lg:col-span-5">
              <ProductImageGallery images={product.images || []} productName={product.name} />
            </div>

            {/* Middle: Product details */}
            <div className="lg:col-span-4">
              <h1 className="text-xl lg:text-2xl font-normal text-[#0f1111] leading-tight mb-1">
                {product.name}
              </h1>

              {/* Brand / Category */}
              <Link href={`/products/category/${product.category.slug}`} className="text-sm text-[#007185] hover:text-[#c7511f] hover:underline">
                Visit the {product.category.name} Store
              </Link>

              {/* Rating */}
              {rating > 0 && (
                <div className="flex items-center gap-2 mt-2 mb-1">
                  <span className="text-sm text-[#0f1111] font-medium">{rating.toFixed(1)}</span>
                  <div className="flex text-[#de7921]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} className="w-4 h-4" fill={s <= Math.round(rating) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    ))}
                  </div>
                  <Link href={`/products/${product.id}/reviews`} className="text-sm text-[#007185] hover:text-[#c7511f] hover:underline">
                    {product.reviewCount || 0} ratings
                  </Link>
                </div>
              )}

              <hr className="my-3 border-gray-200" />

              {/* Price section */}
              <div className="mb-3">
                {product.discountPrice ? (
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs text-[#565959] bg-[#cc0c39] text-white px-2 py-0.5 rounded-sm font-medium">
                        -{discountPct}%
                      </span>
                      <span className="text-[28px] font-light text-[#0f1111]">
                        ${Number(product.discountPrice).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-[#565959]">
                      List Price: <span className="line-through">${Number(product.price).toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-[28px] font-light text-[#0f1111]">
                    ${Number(product.price).toFixed(2)}
                  </span>
                )}
              </div>

              <hr className="my-3 border-gray-200" />

              {/* About this item / Description */}
              <div className="mb-4">
                <h2 className="text-sm font-bold text-[#0f1111] mb-2">About this item</h2>
                <div className="text-sm text-[#333] leading-relaxed whitespace-pre-line">
                  {product.description}
                </div>
              </div>

              {/* SKU */}
              {product.sku && (
                <div className="text-xs text-[#565959] mb-2">
                  <span className="font-medium text-[#0f1111]">SKU:</span> {product.sku}
                </div>
              )}
            </div>

            {/* Right: Buy box */}
            <div className="lg:col-span-3">
              <div className="border border-gray-300 rounded-lg p-4 sticky top-4">
                {/* Price in buy box */}
                <div className="mb-3">
                  <span className="text-lg font-medium text-[#0f1111]">
                    ${Number(product.discountPrice || product.price).toFixed(2)}
                  </span>
                </div>

                {/* Delivery info */}
                <div className="text-sm text-[#0f1111] mb-3">
                  <span className="text-[#007185]">FREE delivery</span>{' '}
                  <span className="font-bold">
                    {new Date(Date.now() + 5 * 86400000).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </span>
                </div>

                {/* Stock */}
                <div className="mb-4">
                  {isInStock ? (
                    <span className="text-lg text-[#007600] font-medium">In Stock</span>
                  ) : (
                    <span className="text-lg text-red-600 font-medium">Out of Stock</span>
                  )}
                  {isLowStock && (
                    <p className="text-sm text-[#c7511f] mt-0.5">
                      Only {product.inventory?.quantity} left in stock - order soon.
                    </p>
                  )}
                </div>

                {/* Add to Cart */}
                <AddToCartButton
                  productId={product.id}
                  isInStock={isInStock}
                  maxQuantity={product.inventory?.quantity || 0}
                />

                {/* Actions */}
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-200">
                  <WishlistButton productId={product.id} initialWishlisted={isWishlisted} size="md" />
                  <ShareButton productName={product.name} productId={product.id} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Frequently Bought Together */}
        <FrequentlyBoughtTogether currentProduct={currentFBT} relatedProducts={fbtProducts} />

        {/* Product Description (expanded) */}
        {product.description && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
            <h2 className="text-lg font-bold text-[#0f1111] mb-4">Product Description</h2>
            <div className="text-sm text-[#333] leading-relaxed whitespace-pre-line max-w-3xl">
              {product.description}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
          <h2 className="text-lg font-bold text-[#0f1111] mb-6">Customer Reviews</h2>

          {/* Rating summary */}
          {rating > 0 && (
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="flex text-[#de7921]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} className="w-5 h-5" fill={s <= Math.round(rating) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-[#0f1111]">{rating.toFixed(1)} out of 5</span>
              <span className="text-sm text-[#565959]">{totalReviews} global ratings</span>
            </div>
          )}

          <ProductReviews
            productId={product.id}
            reviews={reviews}
            totalReviews={totalReviews}
            averageRating={rating}
          />
        </div>

        {/* Write a Review */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
          <h2 className="text-lg font-bold text-[#0f1111] mb-4">Review this product</h2>
          <p className="text-sm text-[#565959] mb-4">Share your thoughts with other customers</p>
          {session ? (
            <ReviewForm productId={product.id} />
          ) : (
            <p className="text-sm text-[#565959]">
              <Link href="/login" className="text-[#007185] hover:text-[#c7511f] hover:underline">
                Sign in
              </Link>{' '}
              to leave a review.
            </p>
          )}
        </div>

        {/* Products related to this item */}
        <Suspense fallback={null}>
          <RelatedProductsSection productId={product.id} categoryId={product.categoryId} />
        </Suspense>

        {/* Recently Viewed */}
        <RecentlyViewed excludeId={product.id} />
      </div>
    </div>
  );
}

async function RelatedProductsSection({ productId, categoryId }: { productId: string; categoryId: string }) {
  const related = await db.query.products.findMany({
    where: and(
      eq(products.categoryId, categoryId),
      ne(products.id, productId),
      eq(products.isActive, true),
    ),
    with: { images: { limit: 1 }, inventory: true },
    orderBy: sql`RANDOM()`,
    limit: 6,
  });

  if (related.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
      <h2 className="text-lg font-bold text-[#0f1111] mb-4">Products related to this item</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {related.map((p) => (
          <Link key={p.id} href={`/products/${p.id}`} className="group">
            <div className="relative aspect-square bg-gray-50 rounded overflow-hidden mb-2">
              {p.images?.[0] ? (
                <Image src={p.images[0].imageUrl} alt={p.name} fill className="object-contain p-2 group-hover:scale-105 transition-transform" sizes="(max-width: 640px) 50vw, 16vw" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs">No Image</div>
              )}
            </div>
            <p className="text-xs text-[#0f1111] line-clamp-2 group-hover:text-[#c7511f] transition-colors">{p.name}</p>
            <span className="text-sm font-medium text-[#0f1111]">${Number(p.discountPrice || p.price).toFixed(2)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
