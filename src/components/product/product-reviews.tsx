import Link from 'next/link';
import type { Review, User } from '@/types';

interface ReviewWithUser extends Review {
  user: User;
}

interface ProductReviewsProps {
  productId: string;
  reviews: ReviewWithUser[];
  totalReviews: number;
  averageRating: number;
}

export function ProductReviews({ productId, reviews, totalReviews, averageRating }: ProductReviewsProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div>
      {/* Rating Summary */}
      {totalReviews > 0 && (
        <div className="mb-8 pb-8 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex mb-2">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={i < Math.round(averageRating) ? 'text-yellow-400 text-xl' : 'text-gray-300 text-xl'}
                  >
                    ★
                  </span>
                ))}
              </div>
              <div className="text-sm text-gray-600">
                {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
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
                        <span
                          key={i}
                          className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {formatDate(review.createdAt)}
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
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No reviews yet. Be the first to review this product!</p>
        </div>
      )}

      {/* View All Reviews Link */}
      {totalReviews > reviews.length && (
        <div className="mt-6 text-center">
          <Link
            href={`/products/${productId}/reviews`}
            className="text-teal-600 hover:text-teal-700 font-semibold"
          >
            View All {totalReviews} Reviews →
          </Link>
        </div>
      )}
    </div>
  );
}
