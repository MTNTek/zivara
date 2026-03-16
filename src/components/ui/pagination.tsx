'use client';

import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    return `${pathname}?${params.toString()}`;
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5;

    if (totalPages <= showPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('...');
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <nav className="flex justify-center items-center gap-2 flex-wrap" aria-label="Pagination">
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="px-4 py-3 min-h-[44px] min-w-[44px] border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center text-black"
        >
          Previous
        </Link>
      ) : (
        <span className="px-4 py-3 min-h-[44px] min-w-[44px] border border-gray-300 rounded-md text-gray-400 cursor-not-allowed flex items-center justify-center">
          Previous
        </span>
      )}

      {/* Page Numbers */}
      <div className="flex gap-2 flex-wrap justify-center">
        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-4 py-3 min-h-[44px] flex items-center">
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <Link
              key={pageNum}
              href={createPageUrl(pageNum)}
              className={`px-4 py-3 min-h-[44px] min-w-[44px] border rounded-md transition-colors flex items-center justify-center ${
                isActive
                  ? 'bg-blue-800 text-white border-blue-800'
                  : 'border-gray-300 hover:bg-gray-50 text-black'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNum}
            </Link>
          );
        })}
      </div>

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="px-4 py-3 min-h-[44px] min-w-[44px] border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center text-black"
        >
          Next
        </Link>
      ) : (
        <span className="px-4 py-3 min-h-[44px] min-w-[44px] border border-gray-300 rounded-md text-gray-400 cursor-not-allowed flex items-center justify-center">
          Next
        </span>
      )}
    </nav>
  );
}
