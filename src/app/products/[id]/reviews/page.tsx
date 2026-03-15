import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductById } from '@/features/products/cached-queries';
import { getProductReviews, type ReviewSortOption } from '@/features/reviews/queries';

interface ReviewsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}

export async function generateMetadata({ params }: ReviewsPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return { title: 'Product Not Found - Zivara' };
  return {
    title: `Reviews for ${product.name} - Zivara`,
    description: `Read customer reviews for ${product.name}`,
  };
}

export default async function ReviewsPage({ params, searchParams }: ReviewsPageProps) {
  const { id } = await params;
  const { page: pageParam, sort } = await searchParams;

  const product = await getProductById(id);
  if (!product) notFound();

  const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);
  const sortBy = (['recent', 'highest', 'lowest'].includes(sort || '') ? sort : 'recent') as ReviewSortOption;

  const { reviews, pagination } = await getProductReviews(product.id, {
    page,
    limit: 10,
    sortBy,
  });

  const avgRating = product.averageRating ? Number(product.averageRating) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-10 py-8 max-w-4xl">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center space-x-2 text-gray-600">
            <li><Link href="/" className="hover:text-black">Home</Link></li>
            <li>/</li>
            <li><Link href="/products" className="hover:text-black">Products</Link></li>
            <li>/</li>
            <li><Link href={`/products/${id}`} className="hover:text-black">{product.name}</Link></li>
            <li>/</li>
            <li className="text-gray-900 font-medium">Reviews</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Reviews for {product.name}
          </h1>
          {pagination.total > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < Math.round(avgRating) ? 'text-[#14B8A6] text-xl' : 'text-gray-300 text-xl'}>
                    ★
                  </span>
                ))}
              </div>
              <span className="text-gray-600">
                {avgRating.toFixed(1)} out of 5 ({pagination.total} {pagination.total === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
        </div>

        {/* Sort Controls */}
        {pagination.total > 1 && (
          <div className="flex gap-2 mb-4">
            {(['recent', 'highest', 'lowest'] as const).map((option) => (
              <Link
                key={option}
                href={`/products/${id}/reviews?sort=${option}`}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  sortBy === option
                    ? 'bg-blue-800 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {option === 'recent' ? 'Most Recent' : option === 'highest' ? 'Highest Rated' : 'Lowest Rated'}
              </Link>
            ))}
          </div>
        )}

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{review.user.name}</span>
                      {review.isVerifiedPurchase && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.rating ? 'text-[#14B8A6]' : 'text-gray-300'}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-line">{review.comment}</p>
                {review.helpfulCount > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    {review.helpfulCount} {review.helpfulCount === 1 ? 'person' : 'people'} found this helpful
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600">No reviews yet for this product.</p>
            <Link href={`/products/${id}`} className="text-black hover:text-gray-700 font-semibold mt-2 inline-block">
              ← Back to Product
            </Link>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {page > 1 && (
              <Link
                href={`/products/${id}/reviews?page=${page - 1}&sort=${sortBy}`}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-black hover:bg-gray-50"
              >
                Previous
              </Link>
            )}
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/products/${id}/reviews?page=${p}&sort=${sortBy}`}
                className={`px-4 py-2 rounded-lg text-sm ${
                  p === page
                    ? 'bg-blue-800 text-white'
                    : 'bg-white border border-gray-300 hover:bg-gray-50 text-black'
                }`}
              >
                {p}
              </Link>
            ))}
            {page < pagination.totalPages && (
              <Link
                href={`/products/${id}/reviews?page=${page + 1}&sort=${sortBy}`}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-black hover:bg-gray-50"
              >
                Next
              </Link>
            )}
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link href={`/products/${id}`} className="text-black hover:text-gray-700 font-semibold">
            ← Back to Product
          </Link>
        </div>
      </div>
    </div>
  );
}
