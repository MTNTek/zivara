'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const slides = [
  {
    id: 1,
    href: '/products/category/electronics',
    title: 'Shop the Latest Electronics',
    subtitle: 'Smartphones, laptops, headphones & more',
    cta: 'Shop Now',
    image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1600&h=500&fit=crop',
    align: 'left' as const,
  },
  {
    id: 2,
    href: '/products/category/mens-fashion',
    title: 'New Season Fashion',
    subtitle: 'Trending styles for everyone',
    cta: 'Explore',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=500&fit=crop',
    align: 'left' as const,
  },
  {
    id: 3,
    href: '/products/category/home-kitchen',
    title: 'Home & Kitchen Essentials',
    subtitle: 'Upgrade your space with top picks',
    cta: 'Shop Home',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&h=500&fit=crop',
    align: 'left' as const,
  },
  {
    id: 4,
    href: '/deals',
    title: 'Deals of the Day',
    subtitle: 'Limited-time offers — save big today',
    cta: 'See Deals',
    image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1600&h=500&fit=crop',
    align: 'left' as const,
  },
  {
    id: 5,
    href: '/products/category/beauty-health',
    title: 'Beauty & Wellness',
    subtitle: 'Skincare, makeup & self-care essentials',
    cta: 'Shop Beauty',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600&h=500&fit=crop',
    align: 'left' as const,
  },
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [isPaused, next]);

  // Keyboard navigation (arrow keys)
  const carouselRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    };
    el.addEventListener('keydown', handleKeyDown);
    return () => el.removeEventListener('keydown', handleKeyDown);
  }, [prev, next]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
  };

  return (
    <div
      ref={carouselRef}
      className="relative w-full outline-none"
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured promotions"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative w-full h-[220px] sm:h-[280px] md:h-[400px] overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === current ? 'opacity-100 z-[1]' : 'opacity-0 z-0'
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={i === 0}
              sizes="100vw"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwMCIgaGVpZ2h0PSI2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzFmMjkzNyIvPjwvc3ZnPg=="
            />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

            <Link href={slide.href} className="relative h-full flex items-center px-8 sm:px-16 lg:px-24">
              <div className="max-w-xl">
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-2 sm:mb-3 leading-tight drop-shadow-lg">
                  {slide.title}
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-white/90 mb-4 sm:mb-6 drop-shadow">
                  {slide.subtitle}
                </p>
                <span className="inline-block bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0f1111] text-sm font-semibold px-6 py-2.5 rounded-full transition-colors shadow-lg">
                  {slide.cta}
                </span>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-t from-[#EAEDED] to-transparent z-[2] pointer-events-none" />

      {/* Left arrow */}
      <button
        onClick={prev}
        className="absolute left-0 top-0 z-[3] h-[calc(100%-64px)] sm:h-[calc(100%-96px)] w-10 sm:w-14 flex items-center justify-center group"
        aria-label="Previous slide"
      >
        <svg className="w-5 h-10 sm:w-6 sm:h-12 text-white/60 group-hover:text-white transition-colors drop-shadow" viewBox="0 0 20 40" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 5 5 20 15 35" />
        </svg>
      </button>

      {/* Right arrow */}
      <button
        onClick={next}
        className="absolute right-0 top-0 z-[3] h-[calc(100%-64px)] sm:h-[calc(100%-96px)] w-10 sm:w-14 flex items-center justify-center group"
        aria-label="Next slide"
      >
        <svg className="w-5 h-10 sm:w-6 sm:h-12 text-white/60 group-hover:text-white transition-colors drop-shadow" viewBox="0 0 20 40" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="5 5 15 20 5 35" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-[70px] sm:bottom-[100px] left-1/2 -translate-x-1/2 z-[3] flex gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === current ? 'bg-white w-5' : 'bg-white/40 w-1.5 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
