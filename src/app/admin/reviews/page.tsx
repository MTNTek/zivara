import { getAdminReviews } from '@/features/reviews/admin-queries';
import { ReviewsClient } from './reviews-client';

export const dynamic = 'force-dynamic';

interface SearchParams {
  page?: string;
  rating?: string;
  search?: string;
}

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const data = await getAdminReviews({
    page: params.page ? parseInt(params.page) : 1,
    rating: params.rating ? parseInt(params.rating) : undefined,
    search: params.search || undefined,
  });

  return <ReviewsClient data={data} />;
}
