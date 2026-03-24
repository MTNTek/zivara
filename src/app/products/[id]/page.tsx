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
import { AlsoViewed } from '@/components/product/also-viewed';
import { getSession } from '@/lib/auth';
import { getWishlistProductIds } from '@/features/wishlist/actions';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq, ne, and, sql } from 'drizzle-orm';
import Link from 'next/link';
import Image from 'next/image';
import { getProductSupplier } from '@/features/suppliers/queries';
import { DeliveryEstimate } from '@/components/product/delivery-estimate';
import { BackToResults } from '@/components/product/back-to-results';
import { NotifyStockButton } from '@/components/product/notify-stock-button';
import { PriceHistoryHint } from '@/components/product/price-history-hint';
import { TrustBadges } from '@/components/product/trust-badges';
import { StickyMobileCTA } from '@/components/product/sticky-mobile-cta';

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

  // Fetch supplier info
  const supplierInfo = await getProductSupplier(product.id);

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
    <div className="min-h-screen bg-[#EAEDED]">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.description?.slice(0, 500),
            image: product.images?.map((img) => img.imageUrl) || [],
            sku: product.sku || product.id,
            brand: { '@type': 'Brand', name: 'Zivara' },
            category: product.category.name,
            offers: {
              '@type': 'Offer',
              url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://zivara.com'}/products/${product.id}`,
              priceCurrency: 'USD',
              price: Number(product.discountPrice || product.price).toFixed(2),
              availability: isInStock
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
              seller: { '@type': 'Organization', name: 'Zivara' },
            },
            ...(rating > 0 && {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: rating.toFixed(1),
                reviewCount: product.reviewCount || 0,
                bestRating: '5',
                worstRating: '1',
              },
            }),
          }),
        }}
      />

      <TrackView
        id={product.id}
        name={product.name}
        price={product.price}
        discountPrice={product.discountPrice}
        imageUrl={primaryImage?.imageUrl}
      />

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <nav className="px-4 sm:px-6 lg:px-10 py-2 text-xs text-[#2563eb]">
          <ol className="flex items-center gap-1 flex-wrap">
            <li><Link href="/" className="hover:text-[#1d4ed8] hover:underline">Home</Link></li>
            <li className="text-gray-400">›</li>
            <li><Link href="/products" className="hover:text-[#1d4ed8] hover:underline">Products</Link></li>
            <li className="text-gray-400">›</li>
            <li>
              <Link href={`/products/category/${product.category.slug}`} className="hover:text-[#1d4ed8] hover:underline">
                {product.category.name}
              </Link>
            </li>
            <li className="text-gray-400">›</li>
            <li className="text-gray-600">{product.name}</li>
          </ol>
        </nav>
      </div>

      <div className="px-4 sm:px-6 lg:px-10 py-6">
        {/* Back to results link */}
        <Suspense fallback={null}>
          <BackToResults />
        </Suspense>

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
              <Link href={`/products/category/${product.category.slug}`} className="text-sm text-[#2563eb] hover:text-[#1d4ed8] hover:underline">
                Visit the {product.category.name} Store
              </Link>

              {/* Supplier attribution */}
              {supplierInfo && (
                <div className="mt-1">
                  <span className="text-xs text-[#565959]">
                    Fulfilled by <span className="text-[#2563eb]">{supplierInfo.displayLabel}</span>
                  </span>
                  {supplierInfo.supplierStatus === 'unavailable' && (
                    <span className="ml-2 text-xs text-orange-600 font-medium">Temporarily unavailable</span>
                  )}
                </div>
              )}

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
                  <Link href={`/products/${product.id}/reviews`} className="text-sm text-[#2563eb] hover:text-[#1d4ed8] hover:underline">
                    {product.reviewCount || 0} ratings
                  </Link>
                  <span className="text-[#ccc]">|</span>
                  <a href="#customer-reviews" className="text-sm text-[#2563eb] hover:text-[#1d4ed8] hover:underline">
                    See all reviews
                  </a>
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

              {/* Product Details Table */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <h3 className="text-sm font-bold text-[#0f1111] mb-2">Product Details</h3>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-1.5 pr-4 text-[#565959] w-1/3">Category</td>
                      <td className="py-1.5 text-[#0f1111]">{product.category.name}</td>
                    </tr>
                    {product.sku && (
                      <tr className="border-b border-gray-100">
                        <td className="py-1.5 pr-4 text-[#565959]">Item Model</td>
                        <td className="py-1.5 text-[#0f1111]">{product.sku}</td>
                      </tr>
                    )}
                    <tr className="border-b border-gray-100">
                      <td className="py-1.5 pr-4 text-[#565959]">Availability</td>
                      <td className="py-1.5">
                        {isInStock ? (
                          <span className="text-[#007600]">In Stock</span>
                        ) : (
                          <span className="text-red-600">Out of Stock</span>
                        )}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-1.5 pr-4 text-[#565959]">Shipping</td>
                      <td className="py-1.5 text-[#0f1111]">Free delivery</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 pr-4 text-[#565959]">Return Policy</td>
                      <td className="py-1.5 text-[#0f1111]">30-day returns</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Buy box */}
            <div className="lg:col-span-3">
              <div className="border border-gray-300 rounded-lg p-4 sticky top-4">
                {/* Price in buy box */}
                <div className="mb-3">
                  <span className="text-lg font-medium text-[#0f1111]">
                    ${Number(product.discountPrice || product.price).toFixed(2)}
                  </span>
                  {product.discountPrice && (
                    <div className="text-xs text-[#565959] mt-0.5">
                      List: <span className="line-through">${Number(product.price).toFixed(2)}</span>
                      <span className="text-[#cc0c39] ml-1.5 font-medium">
                        You save ${(Number(product.price) - Number(product.discountPrice)).toFixed(2)} ({discountPct}%)
                      </span>
                    </div>
                  )}
                  {discountPct >= 15 && <PriceHistoryHint discountPct={discountPct} />}
                </div>

                {/* Delivery info */}
                <DeliveryEstimate isInStock={isInStock} />

                {/* Stock */}
                <div className="mb-4">
                  {isInStock ? (
                    <span className="text-lg text-[#007600] font-medium">In Stock</span>
                  ) : (
                    <>
                      <span className="text-lg text-red-600 font-medium">Out of Stock</span>
                      <div className="mt-2">
                        <NotifyStockButton productName={product.name} productId={product.id} />
                      </div>
                    </>
                  )}
                  {isLowStock && (
                    <p className="text-sm text-[#cc0c39] mt-0.5 flex items-center gap-1">
                      <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      Only {product.inventory?.quantity} left in stock — order soon
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

                {/* Secure transaction */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 text-xs text-[#565959]">
                  <svg className="w-4 h-4 text-[#007600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Secure transaction</span>
                </div>

                {/* Return policy */}
                <div className="flex items-center gap-2 mt-2 text-xs text-[#565959]">
                  <svg className="w-4 h-4 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  <Link href="/shipping" className="text-[#2563eb] hover:text-[#1d4ed8] hover:underline">
                    30-day returnable
                  </Link>
                </div>

                {/* Gift option */}
                <div className="flex items-center gap-2 mt-2 text-xs text-[#565959]">
                  <svg className="w-4 h-4 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                  <span>Gift wrap available</span>
                </div>

                {/* Report issue */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <Link
                    href={`/contact`}
                    className="flex items-center gap-1.5 text-xs text-[#565959] hover:text-[#1d4ed8] transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                    </svg>
                    Report an issue with this product
                  </Link>
                </div>

                {/* Trust Badges */}
                <TrustBadges />
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
        <div id="customer-reviews" className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
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
              <Link href="/login" className="text-[#2563eb] hover:text-[#1d4ed8] hover:underline">
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

        {/* Customers who viewed this also viewed */}
        <Suspense fallback={null}>
          <AlsoViewed productId={product.id} categoryId={product.categoryId} />
        </Suspense>

        {/* Recently Viewed */}
        <RecentlyViewed excludeId={product.id} />
      </div>

      {/* Sticky mobile Add to Cart */}
      <StickyMobileCTA
        productId={product.id}
        price={product.price}
        discountPrice={product.discountPrice}
        isInStock={isInStock}
        productName={product.name}
      />
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-5">
        {related.map((p) => {
          const dp = p.discountPrice || p.price;
          const d = Math.floor(Number(dp));
          const c = Math.round((Number(dp) - d) * 100).toString().padStart(2, '0');
          return (
          <Link key={p.id} href={`/products/${p.id}`} className="group">
            <div className="relative aspect-square bg-white rounded overflow-hidden mb-1">
              {p.images?.[0] ? (
                <Image src={p.images[0].imageUrl} alt={p.name} fill className="object-contain p-3" sizes="(max-width: 640px) 50vw, 16vw" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-300 text-xs">No Image</div>
              )}
            </div>
            <p className="text-[13px] leading-[18px] text-[#0f1111] line-clamp-2 group-hover:text-[#1d4ed8] transition-colors">{p.name}</p>
            <span className="text-[#0F1111]">
              <sup className="text-[11px] font-medium" style={{ top: '-0.5em' }}>$</sup>
              <span className="text-[21px] font-light">{d}</span>
              <sup className="text-[11px] font-medium" style={{ top: '-0.5em' }}>{c}</sup>
            </span>
          </Link>
          );
        })}
      </div>
    </div>
  );
}
