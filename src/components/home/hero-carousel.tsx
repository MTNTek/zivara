'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const slides = [
  {
    id: 1,
    href: '/products?categoryId=electronics',
    alt: 'Shop Electronics — Smartphones, Laptops, Headphones & More',
    // Deep navy/dark blue — tech & electronics feel
    bg: '#232f3e',
    bannerUrl: 'https://placehold.co/1500x600/232f3e/febd69?text=Shop+the+Latest+Electronics',
  },
  {
    id: 2,
    href: '/products?categoryId=fashion',
    alt: 'New Season Fashion — Trending Styles for Everyone',
    // Warm burgundy/wine — fashion & style
    bg: '#5c1a33',
    bannerUrl: 'https://placehold.co/1500x600/5c1a33/f8e0c0?text=New+Season+Fashion',
  },
  {
    id: 3,
    href: '/products?categoryId=home-kitchen',
    alt: 'Home & Kitchen Essentials — Upgrade Your Space',
    // Earthy teal/green — home & nature
    bg: '#1a4a3a',
    bannerUrl: 'https://placehold.co/1500x600/1a4a3a/c8e6d0?text=Home+%26+Kitchen+Essentials',
  },
  {
    id: 4,
    href: '/products?sortBy=price_asc',
    alt: 'Deals of the Day — Limited Time Offers',
    // Rich dark orange/brown — urgency & deals
    bg: '#6b3410',
    bannerUrl: 'https://placehold.co/1500x600/6b3410/ffd699?text=Deals+of+the+Day',
  },
  {
    id: 5,
    href: '/products?categoryId=beauty-health',
    alt: 'Beauty & Health — Skincare, Makeup & Wellness',
    // Soft plum/purple — beauty & wellness
    bg: '#3d1f4a',
    bannerUrl: 'https://placehold.co/1500x600/3d1f4a/e0c8f0?text=Beauty+%26+Health',
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
      {/* Background color that matches current slide — visible while image loads */}
      <div
        className="absolute inset-0 transition-colors duration-700"
        style={{ backgroundColor: slides[current].bg }}
      />

      {/* Slide images */}
      <div className="relative w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[600px] overflow-hidden">
        {slides.map((slide, i) => (
          <Link
            key={slide.id}
            href={slide.href}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === current ? 'opacity-100 z-[1]' : 'opacity-0 z-0'
            }`}
            aria-hidden={i !== current}
            tabIndex={i === current ? 0 : -1}
          >
            <Image
              src={slide.bannerUrl}
              alt={slide.alt}
              fill
              className="object-cover object-top"
              sizes="100vw"
              priority={i === 0}
            />
          </Link>
        ))}
      </div>

      {/* Bottom gradient fade — Amazon's signature fade to page background */}
      <div className="absolute bottom-0 left-0 right-0 h-[80px] sm:h-[120px] md:h-[160px] lg:h-[280px] bg-gradient-to-t from-[#e3e6e6] to-transparent z-[2] pointer-events-none" />

      {/* Left arrow */}
      <button
        onClick={(e) => { e.stopPropagation(); prev(); }}
        className="absolute left-0 top-0 z-[3] h-[calc(100%-80px)] sm:h-[calc(100%-120px)] md:h-[calc(100%-160px)] lg:h-[calc(100%-280px)] w-[42px] sm:w-[56px] lg:w-[80px] flex items-center justify-center cursor-pointer group"
        aria-label="Previous slide"
      >
        <svg
          className="w-[18px] h-[36px] sm:w-[22px] sm:h-[44px] lg:w-[28px] lg:h-[56px] text-[#484848] group-hover:text-white transition-colors"
          viewBox="0 0 20 40"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 5 5 20 15 35" />
        </svg>
      </button>

      {/* Right arrow */}
      <button
        onClick={(e) => { e.stopPropagation(); next(); }}
        className="absolute right-0 top-0 z-[3] h-[calc(100%-80px)] sm:h-[calc(100%-120px)] md:h-[calc(100%-160px)] lg:h-[calc(100%-280px)] w-[42px] sm:w-[56px] lg:w-[80px] flex items-center justify-center cursor-pointer group"
        aria-label="Next slide"
      >
        <svg
          className="w-[18px] h-[36px] sm:w-[22px] sm:h-[44px] lg:w-[28px] lg:h-[56px] text-[#484848] group-hover:text-white transition-colors"
          viewBox="0 0 20 40"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="5 5 15 20 5 35" />
        </svg>
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-[90px] sm:bottom-[130px] md:bottom-[170px] lg:bottom-[290px] left-1/2 -translate-x-1/2 z-[3] flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === current
                ? 'bg-white w-4'
                : 'bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
