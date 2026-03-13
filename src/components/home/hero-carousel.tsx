'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const slides = [
  {
    id: 1,
    href: '/products?category=electronics',
    title: 'Shop the Latest Electronics',
    subtitle: 'Smartphones, laptops, headphones & more',
    cta: 'Shop Now',
    bg: 'linear-gradient(135deg, #0f2027 0%, #203a43 40%, #2c5364 100%)',
  },
  {
    id: 2,
    href: '/products?category=fashion',
    title: 'New Season Fashion',
    subtitle: 'Trending styles for everyone',
    cta: 'Explore',
    bg: 'linear-gradient(135deg, #3c1053 0%, #ad5389 100%)',
  },
  {
    id: 3,
    href: '/products?category=home-kitchen',
    title: 'Home & Kitchen Essentials',
    subtitle: 'Upgrade your space with top picks',
    cta: 'Shop Home',
    bg: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
  },
  {
    id: 4,
    href: '/products?sortBy=price_asc',
    title: 'Deals of the Day',
    subtitle: 'Limited-time offers — save big today',
    cta: 'See Deals',
    bg: 'linear-gradient(135deg, #c94b4b 0%, #4b134f 100%)',
  },
  {
    id: 5,
    href: '/products?category=beauty-health',
    title: 'Beauty & Wellness',
    subtitle: 'Skincare, makeup & self-care essentials',
    cta: 'Shop Beauty',
    bg: 'linear-gradient(135deg, #614385 0%, #516395 100%)',
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
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [isPaused, next]);

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      <div className="relative w-full h-[220px] sm:h-[280px] md:h-[360px] overflow-hidden">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === current ? 'opacity-100 z-[1]' : 'opacity-0 z-0'
            }`}
            style={{ background: slide.bg }}
          >
            {/* Decorative circles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -right-20 -top-20 w-[400px] h-[400px] rounded-full bg-white/5" />
              <div className="absolute -right-10 top-20 w-[300px] h-[300px] rounded-full bg-white/5" />
              <div className="absolute left-1/2 -bottom-32 w-[500px] h-[500px] rounded-full bg-white/3" />
            </div>

            {/* Content */}
            <Link href={slide.href} className="relative h-full flex items-center px-8 sm:px-16 lg:px-24">
              <div className="max-w-xl">
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-2 sm:mb-3 leading-tight">
                  {slide.title}
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-white/80 mb-4 sm:mb-6">
                  {slide.subtitle}
                </p>
                <span className="inline-block bg-[#febd69] hover:bg-[#f3a847] text-[#0f1111] text-sm font-semibold px-6 py-2.5 rounded-sm transition-colors">
                  {slide.cta}
                </span>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-t from-[#e3e6e6] to-transparent z-[2] pointer-events-none" />

      {/* Left arrow */}
      <button
        onClick={prev}
        className="absolute left-0 top-0 z-[3] h-[calc(100%-64px)] sm:h-[calc(100%-96px)] w-10 sm:w-14 flex items-center justify-center group"
        aria-label="Previous slide"
      >
        <svg className="w-5 h-10 sm:w-6 sm:h-12 text-white/50 group-hover:text-white transition-colors" viewBox="0 0 20 40" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 5 5 20 15 35" />
        </svg>
      </button>

      {/* Right arrow */}
      <button
        onClick={next}
        className="absolute right-0 top-0 z-[3] h-[calc(100%-64px)] sm:h-[calc(100%-96px)] w-10 sm:w-14 flex items-center justify-center group"
        aria-label="Next slide"
      >
        <svg className="w-5 h-10 sm:w-6 sm:h-12 text-white/50 group-hover:text-white transition-colors" viewBox="0 0 20 40" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
