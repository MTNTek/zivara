'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReviewDeleteButton } from '@/components/admin/review-delete-button';
import type { ReviewsResult } from '@/features/reviews/admin-queries';

export function ReviewsClient({ data }: { data: ReviewsResult }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const activeRating = searchParams.get('rating') ? parseInt(searchParams.get('rating')!) : null;
  const currentPage = data.pagination.page;

  function navigate(params: Record<string, string | null>) {
    const sp = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([k, v]) => {
      if (v === null || v === '') sp.delete(k);
      else sp.set(k, v);
    });
    startTransition(() => router.push(`/admin/reviews?${sp.toString()}`));
  }

  return (
    <div className={isPending ? 'opacity-60 pointer-events-none transition-opacity' : ''}>
      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Total Reviews</p>
          <p className="text-2xl font-bold text-gray-900">{data.stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Verified Reviews</p>
          <p className="text-2xl font-bold text-gray-900">{data.stats.verified}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Average Rating</p>
          <p className="text-2xl font-bold text-gray-900">{data.stats.averageRating.toFixed(1)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 mb-2">Rating Distribution</p>
          <div className="space-y-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = data.stats.distribution[star] || 0;
              const pct = data.stats.total > 0 ? (count / data.stats.total) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500 w-3">{star}</span>
                  <span className="text-[#de7921] text-xs">★</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#de7921] rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-400 w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <form
          onSubmit={(e) => { e.preventDefault(); navigate({ search, page: null }); }}
          className="flex-1 flex gap-2"
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product, customer name or email..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button type="submit" className="px-4 py-2 bg-blue-800 text-white rounded-lg text-sm hover:bg-blue-900">
            Search
          </button>
          {search && (
            <button type="button" onClick={() => { setSearch(''); navigate({ search: null, page: null }); }} className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
              Clear
            </button>
          )}
        </form>

        {/* Rating filter tabs */}
        <div className="flex gap-1">
          <button
            onClick={() => navigate({ rating: null, page: null })}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              !activeRating ? 'bg-blue-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {[5, 4, 3, 2, 1].map((r) => (
            <button
              key={r}
              onClick={() => navigate({ rating: activeRating === r ? null : String(r), page: null })}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                activeRating === r ? 'bg-blue-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {r} <span className={activeRating === r ? 'text-yellow-300' : 'text-[#de7921]'}>★</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="mb-3 text-sm text-gray-500">
        Showing {data.reviews.length} of {data.pagination.total} reviews
        {activeRating && ` with ${activeRating} star${activeRating !== 1 ? 's' : ''}`}
      </div>

      {/* Reviews Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.reviews.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No reviews found
                </td>
              </tr>
            ) : (
              data.reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/products/${review.productId}`} className="text-sm font-medium text-black hover:text-blue-900">
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
                      <span className="text-[#de7921] mr-1">★</span>
                      <span className="text-sm font-medium text-gray-900">{review.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">{review.comment || 'No comment'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      review.isVerifiedPurchase ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {review.isVerifiedPurchase ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <ReviewDeleteButton reviewId={review.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data.pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Page {currentPage} of {data.pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => navigate({ page: String(currentPage - 1) })}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              disabled={currentPage >= data.pagination.totalPages}
              onClick={() => navigate({ page: String(currentPage + 1) })}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
