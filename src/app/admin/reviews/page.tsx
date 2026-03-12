import { db } from '@/db';
import { reviews, users, products } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage() {
  const allReviews = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      isVerifiedPurchase: reviews.isVerifiedPurchase,
      createdAt: reviews.createdAt,
      userName: users.name,
      userEmail: users.email,
      productName: products.name,
      productId: products.id,
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .leftJoin(products, eq(reviews.productId, products.id))
    .orderBy(desc(reviews.createdAt))
    .limit(100);

  return (
    <div>
      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Total Reviews</p>
          <p className="text-2xl font-bold text-gray-900">{allReviews.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Verified Reviews</p>
          <p className="text-2xl font-bold text-gray-900">
            {allReviews.filter((r) => r.isVerifiedPurchase).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Average Rating</p>
          <p className="text-2xl font-bold text-gray-900">
            {allReviews.length > 0
              ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
              : '0.0'}
          </p>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allReviews.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No reviews found
                </td>
              </tr>
            ) : (
              allReviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/products/${review.productId}`}
                      className="text-sm font-medium text-teal-600 hover:text-teal-900"
                    >
                      {review.productName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{review.userName || 'Anonymous'}</div>
                      <div className="text-gray-500">{review.userEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      <span className="text-sm font-medium text-gray-900">{review.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {review.comment || 'No comment'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        review.isVerifiedPurchase
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {review.isVerifiedPurchase ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
