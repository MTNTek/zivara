'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const stripCategories = [
  { label: 'Mobiles', href: '/products/category/smartphones', img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop' },
  { label: 'Laptops', href: '/products/category/laptops-computers', img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop' },
  { label: 'Headphones', href: '/products/category/audio-headphones', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop' },
  { label: 'TVs', href: '/products/category/tvs-displays', img: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=200&h=200&fit=crop' },
  { label: 'Gaming', href: '/products/category/gaming', img: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=200&h=200&fit=crop' },
  { label: 'Fashion', href: '/products/category/mens-fashion', img: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=200&h=200&fit=crop' },
  { label: 'Beauty', href: '/products/category/beauty-health', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop' },
  { label: 'Home', href: '/products/category/home-kitchen', img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop' },
  { label: 'Sports', href: '/products/category/sports-outdoors', img: 'https://images.unsplash.com/photo-1461896836934-bd45ba8fcf9b?w=200&h=200&fit=crop' },
  { label: 'Toys', href: '/products/category/toys-games', img: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=200&h=200&fit=crop' },
  { label: 'Books', href: '/products/category/books', img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&h=200&fit=crop' },
  { label: 'Cameras', href: '/products/category/cameras-photography', img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&h=200&fit=crop' },
];

export function CategoryStrip() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.6;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className="bg-white py-4 px-4 sm:px-6 lg:px-10 relative">
      <h2 className="text-[16px] font-bold text-[#0f1111] mb-3">Shop by category</h2>

      {/* Scroll arrows */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 translate-y-1 z-10 bg-white/90 border border-gray-200 shadow-sm rounded-r w-[32px] h-[64px] flex items-center justify-center hover:bg-gray-50"
        aria-label="Scroll left"
      >
        <svg className="w-4 h-4 text-[#555]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 translate-y-1 z-10 bg-white/90 border border-gray-200 shadow-sm rounded-l w-[32px] h-[64px] flex items-center justify-center hover:bg-gray-50"
        aria-label="Scroll right"
      >
        <svg className="w-4 h-4 text-[#555]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-1"
      >
        {stripCategories.map((cat) => (
          <Link
            key={cat.label}
            href={cat.href}
            className="flex flex-col items-center gap-2 flex-shrink-0 group"
          >
            <div className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] rounded-lg overflow-hidden bg-[#f7f7f7] border border-[#e7e7e7] group-hover:border-[#c7511f] transition-colors">
              <Image
                src={cat.img}
                alt={cat.label}
                width={140}
                height={140}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />
            </div>
            <span className="text-[13px] text-[#0f1111] font-medium text-center">
              {cat.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
