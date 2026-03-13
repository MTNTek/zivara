'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const slides = [
  {
    id: 1,
    gradient: 'from-[#232f3e] via-[#37475a] to-[#232f3e]',
    title: 'Shop the Latest Electronics',
    subtitle: 'Discover deals on smartphones, laptops, headphones and more',
    cta: 'Shop Electronics',
    href: '/products?categoryId=electronics',
    accent: '#febd69',
  },
  {
    id: 2,
    gradient: 'from-[#1a3a4a] via-[#2d6a7a] to-[#1a3a4a]',
    title: 'New Season Fashion',
    subtitle: 'Refresh your wardrobe with trending styles',
    cta: 'Explore Fashion',
    href: '/products?categoryId=fashion',
    accent: '#ff9900',
  },
  {
    id: 3,
    gradient: 'from-[#3b1f2b] via-[#6b3a4a] to-[#3b1f2b]',
    title: 'Home & Kitchen Essentials',
    subtitle: 'Everything you need to make your house a home',
    cta: 'Shop Home',
    href: '/products?categoryId=home-kitchen',
    accent: '#febd69',
  },
  {
    id: 4,
    gradient: 'from-[#1a2e1a] via-[#2d5a2d] to-[#1a2e1a]',
    title: 'Deals of the Day',
    subtitle: 'Limited-time offers on top products — save big today',
    cta: 'See Deals',
    href: '/products?sortBy=price_asc',
    accent: '#ff9900',
  },
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isPaused, next]);

  const slide = slides[current];

  return (
    <div
      className="relative w-full h-[280px] sm:h-[350px] md:h-[420px] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} transition-all duration-700`}
      />

      {/* Decorative pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-1/2 h-full">
          <svg viewBox="0 0 400 400" className="w-full h-full" fill="none">
            <circle cx="300" cy="200" r="180" stroke="white" strokeWidth="0.5" />
            <circle cx="300" cy="200" r="140" stroke="white" strokeWidth="0.5" />
            <circle cx="300" cy="200" r="100" stroke="white" strokeWidth="0.5" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg">
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 leading-tight transition-all duration-500"
              key={slide.id}
            >
              {slide.title}
            </h2>
            <p className="text-base sm:text-lg text-gray-300 mb-6">
              {slide.subtitle}
            </p>
            <Link
              href={slide.href}
              className="inline-block px-8 py-3 rounded-sm font-semibold text-sm transition-colors"
              style={{ backgroundColor: slide.accent, color: '#0f1111' }}
            >
              {slide.cta}
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom fade for card overlap effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#e3e6e6] to-transparent" />

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-0 top-0 bottom-16 w-12 sm:w-16 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/10 transition-colors"
        aria-label="Previous slide"
      >
        <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={next}
        className="absolute right-0 top-0 bottom-16 w-12 sm:w-16 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/10 transition-colors"
        aria-label="Next slide"
      >
        <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
