export function SocialProofBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-4 px-4 sm:px-6 lg:px-10">
      <div className="flex items-center justify-center gap-6 sm:gap-12 text-center text-sm flex-wrap">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-[#fbbf24]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span><span className="font-semibold">10,000+</span> Happy Customers</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-[#fbbf24]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <span><span className="font-semibold">4.8/5</span> Average Rating</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-[#fbbf24]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span><span className="font-semibold">Free Shipping</span> on $50+</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-[#fbbf24]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span><span className="font-semibold">30-Day</span> Returns</span>
        </div>
      </div>
    </div>
  );
}
