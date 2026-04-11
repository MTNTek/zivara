'use client';

import { useState, useTransition } from 'react';
import { submitReview } from '@/features/reviews/actions-client';

interface ReviewFormProps {
  productId: string;
}

const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

export function ReviewForm({ productId }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const activeRating = hoveredRating || rating;
  const minChars = 10;
  const maxChars = 2000;
  const charProgress = Math.min((comment.length / minChars) * 100, 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    startTransition(async () => {
      const result = await submitReview({ productId, rating, comment });
      if (result.success) {
        setSuccess(true);
        setRating(0);
        setComment('');
      } else {
        setError(result.error || 'Something went wrong');
      }
    });
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <svg className="w-10 h-10 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-green-800 font-semibold">Thank you for your review!</p>
        <p className="text-green-700 text-sm mt-1">Your feedback helps other shoppers.</p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-3 text-sm text-[#2563eb] hover:text-[#1d4ed8] hover:underline"
        >
          Write another review
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Star Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Overall Rating
        </label>
        <div className="flex items-center gap-3">
          <div className="flex gap-0.5" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={rating === star}
                aria-label={`${star} star${star > 1 ? 's' : ''} - ${ratingLabels[star]}`}
                className="text-3xl transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#2563eb] rounded p-0.5"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              >
                <span className={star <= activeRating ? 'text-[#FFA41C]' : 'text-gray-300'}>
                  ★
                </span>
              </button>
            ))}
          </div>
          {activeRating > 0 && (
            <span className="text-sm text-gray-600 font-medium">{ratingLabels[activeRating]}</span>
          )}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-2">
          Your Review
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, maxChars))}
          rows={4}
          minLength={minChars}
          maxLength={maxChars}
          required
          placeholder="What did you like or dislike? How did you use this product? (min 10 characters)"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#2563eb] focus:border-transparent resize-vertical text-sm"
        />
        <div className="flex items-center justify-between mt-1.5">
          {/* Character progress bar */}
          <div className="flex items-center gap-2 flex-1">
            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  comment.length >= minChars ? 'bg-green-500' : 'bg-orange-400'
                }`}
                style={{ width: `${charProgress}%` }}
              />
            </div>
            <span className={`text-xs ${comment.length >= minChars ? 'text-green-600' : 'text-gray-500'}`}>
              {comment.length < minChars
                ? `${minChars - comment.length} more needed`
                : 'Looks good'}
            </span>
          </div>
          <span className="text-xs text-gray-400">{comment.length}/{maxChars}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || rating === 0 || comment.length < minChars}
        className="bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0F1111] px-6 py-2.5 rounded-full text-sm font-medium border border-[#FCD200] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#f59e0b] focus:ring-offset-2"
      >
        {isPending ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}