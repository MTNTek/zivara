'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import type { ProductImage } from '@/types';

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [showFullscreen, setShowFullscreen] = useState(false);

  // Touch/swipe state
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const isSwiping = useRef(false);
  const mainImageRef = useRef<HTMLDivElement>(null);

  const goToPrev = useCallback(() => {
    if (images && images.length > 1) {
      setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }
  }, [images]);

  const goToNext = useCallback(() => {
    if (images && images.length > 1) {
      setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }
  }, [images]);

  // Keyboard navigation + body scroll lock for fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showFullscreen && e.key === 'Escape') setShowFullscreen(false);
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrev, goToNext, showFullscreen]);

  useEffect(() => {
    if (showFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showFullscreen]);

  // Touch handlers for swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    const diffX = Math.abs(touchEndX.current - touchStartX.current);
    const diffY = Math.abs(e.touches[0].clientY - touchStartY.current);
    // Only count as swipe if horizontal movement > vertical
    if (diffX > 10 && diffX > diffY) {
      isSwiping.current = true;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;
    if (Math.abs(diff) >= minSwipeDistance) {
      if (diff > 0) goToNext();
      else goToPrev();
    }
    isSwiping.current = false;
  }, [goToNext, goToPrev]);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  const selectedImage = images[selectedIndex];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  return (
    <>
      <div className="flex gap-3">
        {/* Left: Vertical thumbnail strip (hidden on mobile) */}
        <div className="hidden sm:flex flex-col gap-2 w-[60px] flex-shrink-0">
          {images.map((image, index) => (
            <button
              key={image.id}
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={() => setSelectedIndex(index)}
              className={`w-[60px] h-[60px] relative bg-gray-50 rounded border-2 overflow-hidden transition-colors flex-shrink-0 ${
                index === selectedIndex
                  ? 'border-[#2563eb] shadow-sm'
                  : 'border-gray-200 hover:border-[#2563eb]'
              }`}
            >
              <Image
                src={image.thumbnailUrl || image.imageUrl}
                alt={image.altText || `${productName} - Image ${index + 1}`}
                fill
                className="object-contain p-1"
                sizes="60px"
              />
            </button>
          ))}
        </div>

        {/* Right: Main image with touch support */}
        <div className="flex-1 relative group">
          <div
            ref={mainImageRef}
            className="aspect-square relative bg-white rounded overflow-hidden cursor-crosshair touch-pan-y"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={selectedImage.imageUrl}
              alt={selectedImage.altText || productName}
              fill
              className={`object-contain transition-transform duration-200 ${isZoomed ? 'scale-[2.5]' : 'scale-100'}`}
              style={isZoomed ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : undefined}
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              draggable={false}
            />

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                  className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  aria-label="Previous image"
                >
                  <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); goToNext(); }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  aria-label="Next image"
                >
                  <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Mobile dot indicators */}
          {images.length > 1 && (
            <div className="flex sm:hidden justify-center gap-1.5 mt-3">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedIndex(index)}
                  className={`rounded-full transition-all ${
                    index === selectedIndex
                      ? 'w-6 h-2 bg-[#2563eb]'
                      : 'w-2 h-2 bg-gray-300'
                  }`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* View full image link */}
          <button
            onClick={() => setShowFullscreen(true)}
            className="mt-2 text-xs text-[#2563eb] hover:text-[#1d4ed8] hover:underline flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
            Click to open expanded view
          </button>
        </div>
      </div>

      {/* Fullscreen lightbox */}
      {showFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setShowFullscreen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setShowFullscreen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
            aria-label="Close fullscreen view"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Fullscreen image with touch support */}
          <div
            className="relative w-[90vw] h-[90vh]"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={selectedImage.imageUrl}
              alt={selectedImage.altText || productName}
              fill
              className="object-contain"
              sizes="90vw"
              draggable={false}
            />
          </div>

          {/* Prev / Next */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full w-12 h-12 flex items-center justify-center transition-colors"
                aria-label="Previous image"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full w-12 h-12 flex items-center justify-center transition-colors"
                aria-label="Next image"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Bottom thumbnails in fullscreen */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2" onClick={(e) => e.stopPropagation()}>
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedIndex(index)}
                  className={`w-14 h-14 relative rounded overflow-hidden border-2 transition-colors ${
                    index === selectedIndex ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={image.thumbnailUrl || image.imageUrl}
                    alt={image.altText || `${productName} - Image ${index + 1}`}
                    fill
                    className="object-contain bg-white p-0.5"
                    sizes="56px"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Image counter */}
          <div className="absolute top-4 left-4 text-white text-sm">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}