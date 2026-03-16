'use client';

import Link from 'next/link';
import { useState, useCallback, useEffect } from 'react';

interface SubCategory {
  name: string;
  href: string;
}

interface SidebarCategory {
  name: string;
  href: string;
  subcategories: SubCategory[];
}

const sidebarCategories: SidebarCategory[] = [
  {
    name: 'Trending',
    href: '/products?sort=popular',
    subcategories: [
      { name: 'Best Sellers', href: '/products?sort=popular' },
      { name: 'New Arrivals', href: '/products?sort=newest' },
      { name: 'Top Rated', href: '/products?sort=rating' },
      { name: "Today's Deals", href: '/products?sort=popular' },
      { name: 'Clearance Sale', href: '/products?sort=price-asc' },
      { name: 'Lightning Deals', href: '/products?sort=popular' },
    ],
  },
  {
    name: 'Digital Content & Devices',
    href: '/products/category/electronics',
    subcategories: [
      { name: 'E-Readers', href: '/products/category/electronics' },
      { name: 'Tablets', href: '/products/category/electronics' },
      { name: 'Smart Speakers', href: '/products/category/electronics' },
      { name: 'Smart Displays', href: '/products/category/electronics' },
      { name: 'Streaming Devices', href: '/products/category/electronics' },
      { name: 'Smart TVs', href: '/products/category/electronics' },
      { name: 'Projectors', href: '/products/category/electronics' },
    ],
  },
  {
    name: 'Mobiles, Tablets & Accessories',
    href: '/products/category/electronics',
    subcategories: [
      { name: 'Smartphones', href: '/products/category/electronics' },
      { name: 'Feature Phones', href: '/products/category/electronics' },
      { name: 'Refurbished Phones', href: '/products/category/electronics' },
      { name: 'Tablets', href: '/products/category/electronics' },
      { name: 'iPads', href: '/products/category/electronics' },
      { name: 'Chargers', href: '/products/category/electronics' },
      { name: 'Power Banks', href: '/products/category/electronics' },
      { name: 'Phone Cases', href: '/products/category/electronics' },
      { name: 'Smart Watches', href: '/products/category/electronics' },
      { name: 'Fitness Trackers', href: '/products/category/electronics' },
    ],
  },
  {
    name: 'Computers & Office Supplies',
    href: '/products/category/electronics',
    subcategories: [
      { name: 'Laptops', href: '/products/category/electronics' },
      { name: 'Desktops', href: '/products/category/electronics' },
      { name: 'Monitors', href: '/products/category/electronics' },
      { name: 'Keyboards & Mice', href: '/products/category/electronics' },
      { name: 'Storage Devices', href: '/products/category/electronics' },
      { name: 'Printers', href: '/products/category/electronics' },
      { name: 'Office Supplies', href: '/products/category/office-products' },
      { name: 'Office Furniture', href: '/products/category/office-products' },
    ],
  },
  {
    name: 'TV, Appliances & Electronics',
    href: '/products/category/electronics',
    subcategories: [
      { name: 'Smart TVs', href: '/products/category/electronics' },
      { name: 'LED TVs', href: '/products/category/electronics' },
      { name: 'OLED TVs', href: '/products/category/electronics' },
      { name: 'Headphones', href: '/products/category/electronics' },
      { name: 'Speakers', href: '/products/category/electronics' },
      { name: 'Soundbars', href: '/products/category/electronics' },
      { name: 'Refrigerators', href: '/products/category/home-kitchen' },
      { name: 'Washing Machines', href: '/products/category/home-kitchen' },
      { name: 'Microwave Ovens', href: '/products/category/home-kitchen' },
    ],
  },
  {
    name: "Women's Fashion",
    href: '/products/category/womens-fashion',
    subcategories: [
      { name: 'Dresses', href: '/products/category/womens-fashion' },
      { name: 'Tops & Tees', href: '/products/category/womens-fashion' },
      { name: 'Jeans & Pants', href: '/products/category/womens-fashion' },
      { name: 'Heels', href: '/products/category/womens-fashion' },
      { name: 'Flats', href: '/products/category/womens-fashion' },
      { name: 'Handbags', href: '/products/category/womens-fashion' },
      { name: 'Jewelry', href: '/products/category/womens-fashion' },
      { name: 'Sunglasses', href: '/products/category/womens-fashion' },
    ],
  },
  {
    name: "Men's Fashion",
    href: '/products/category/mens-fashion',
    subcategories: [
      { name: 'T-Shirts & Polos', href: '/products/category/mens-fashion' },
      { name: 'Shirts', href: '/products/category/mens-fashion' },
      { name: 'Jeans & Pants', href: '/products/category/mens-fashion' },
      { name: 'Sneakers', href: '/products/category/mens-fashion' },
      { name: 'Formal Shoes', href: '/products/category/mens-fashion' },
      { name: 'Watches', href: '/products/category/mens-fashion' },
      { name: 'Wallets', href: '/products/category/mens-fashion' },
      { name: 'Belts', href: '/products/category/mens-fashion' },
    ],
  },
  {
    name: "Kids' Fashion",
    href: '/products/category/kids-fashion',
    subcategories: [
      { name: 'Boys Clothing', href: '/products/category/kids-fashion' },
      { name: 'Girls Clothing', href: '/products/category/kids-fashion' },
      { name: 'Kids Sneakers', href: '/products/category/kids-fashion' },
      { name: 'School Shoes', href: '/products/category/kids-fashion' },
      { name: 'Baby Clothing', href: '/products/category/kids-fashion' },
      { name: 'Diapers', href: '/products/category/kids-fashion' },
    ],
  },
  {
    name: 'Health, Beauty & Perfumes',
    href: '/products/category/beauty-health',
    subcategories: [
      { name: 'Moisturizers', href: '/products/category/beauty-health' },
      { name: 'Serums', href: '/products/category/beauty-health' },
      { name: 'Sunscreen', href: '/products/category/beauty-health' },
      { name: 'Foundation', href: '/products/category/beauty-health' },
      { name: 'Lipstick', href: '/products/category/beauty-health' },
      { name: "Women's Perfumes", href: '/products/category/beauty-health' },
      { name: "Men's Cologne", href: '/products/category/beauty-health' },
      { name: 'Vitamins & Supplements', href: '/products/category/beauty-health' },
    ],
  },
  {
    name: 'Grocery',
    href: '/products/category/grocery',
    subcategories: [
      { name: 'Fruits & Vegetables', href: '/products/category/grocery' },
      { name: 'Dairy & Eggs', href: '/products/category/grocery' },
      { name: 'Meat & Seafood', href: '/products/category/grocery' },
      { name: 'Rice & Grains', href: '/products/category/grocery' },
      { name: 'Coffee & Tea', href: '/products/category/grocery' },
      { name: 'Snacks', href: '/products/category/grocery' },
    ],
  },
  {
    name: 'Home, Kitchen & Pets',
    href: '/products/category/home-kitchen',
    subcategories: [
      { name: 'Living Room Furniture', href: '/products/category/home-kitchen' },
      { name: 'Bedroom Furniture', href: '/products/category/home-kitchen' },
      { name: 'Cookware', href: '/products/category/home-kitchen' },
      { name: 'Dinnerware', href: '/products/category/home-kitchen' },
      { name: 'Lighting', href: '/products/category/home-kitchen' },
      { name: 'Rugs & Carpets', href: '/products/category/home-kitchen' },
      { name: 'Dog Supplies', href: '/products/category/pet-supplies' },
      { name: 'Cat Supplies', href: '/products/category/pet-supplies' },
    ],
  },
  {
    name: 'Tools & Home Improvement',
    href: '/products/category/tools',
    subcategories: [
      { name: 'Drills', href: '/products/category/tools' },
      { name: 'Saws', href: '/products/category/tools' },
      { name: 'Screwdrivers', href: '/products/category/tools' },
      { name: 'Wrenches', href: '/products/category/tools' },
      { name: 'Light Bulbs', href: '/products/category/tools' },
      { name: 'Faucets', href: '/products/category/tools' },
    ],
  },
];

export function MegaMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [activeCategory, setActiveCategory] = useState<SidebarCategory | null>(null);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setActiveCategory(null);
  }, []);

  const handleBack = useCallback(() => {
    setActiveCategory(null);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeCategory) {
          setActiveCategory(null);
        } else {
          handleClose();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeCategory, handleClose]);

  // Lock body scroll when open + measure header
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const header = document.querySelector('header');
      if (header) {
        setHeaderHeight(header.getBoundingClientRect().height);
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => {
          if (isOpen) {
            handleClose();
          } else {
            setIsOpen(true);
          }
        }}
        className="flex items-center gap-2 text-white px-3 py-1 transition-colors font-bold"
        aria-label="Open category menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        All
      </button>

      {isOpen && (
        <div className="fixed left-0 right-0 bottom-0 z-[55]" style={{ top: `${headerHeight}px` }}>
          <div
            className="absolute inset-0 bg-black/50 transition-opacity"
            onClick={handleClose}
          />

          <div className="relative h-full">
            <div className="mega-menu-sidebar w-[280px] bg-white h-full overflow-y-scroll flex-shrink-0 shadow-xl animate-slide-in-left">

              {/* Main category list */}
              {!activeCategory && (
                <div className="py-1">
                  <div className="px-5 py-2.5">
                    <span className="font-bold text-[#111] text-[15px]">Shop by Department</span>
                  </div>
                  <div className="border-b border-gray-200" />
                  {sidebarCategories.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => setActiveCategory(category)}
                      className="w-full flex items-center justify-between px-5 py-2.5 text-sm text-[#111] hover:bg-gray-100 transition-colors text-left"
                    >
                      <span>{category.name}</span>
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}

                  <div className="border-t border-gray-200 py-1 mt-1">
                    <div className="px-5 py-2.5">
                      <span className="font-bold text-[#111] text-[15px]">Help & Settings</span>
                    </div>
                    <Link href="/profile" onClick={handleClose} className="block px-5 py-2.5 text-sm text-[#111] hover:bg-gray-100 transition-colors">
                      Your Account
                    </Link>
                    <Link href="/contact" onClick={handleClose} className="block px-5 py-2.5 text-sm text-[#111] hover:bg-gray-100 transition-colors">
                      Customer Service
                    </Link>
                    <Link href="/login" onClick={handleClose} className="block px-5 py-2.5 text-sm text-[#111] hover:bg-gray-100 transition-colors">
                      Sign In
                    </Link>
                  </div>
                </div>
              )}

              {/* Subcategory drill-down view */}
              {activeCategory && (
                <div className="py-1">
                  {/* Back button */}
                  <button
                    onClick={handleBack}
                    className="w-full flex items-center gap-2 px-5 py-3 text-sm font-bold text-[#111] hover:bg-gray-100 transition-colors border-b border-gray-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Main Menu
                  </button>

                  {/* Category title */}
                  <div className="px-5 py-2.5 border-b border-gray-200">
                    <Link
                      href={activeCategory.href}
                      onClick={handleClose}
                      className="font-bold text-[#111] text-[15px] hover:text-[#c7511f] transition-colors"
                    >
                      {activeCategory.name}
                    </Link>
                  </div>

                  {/* Subcategory links */}
                  {activeCategory.subcategories.map((sub) => (
                    <Link
                      key={sub.name}
                      href={sub.href}
                      onClick={handleClose}
                      className="block px-5 py-2.5 text-sm text-[#111] hover:bg-gray-100 transition-colors"
                    >
                      {sub.name}
                    </Link>
                  ))}

                  {/* See all link */}
                  <div className="border-t border-gray-200 mt-1">
                    <Link
                      href={activeCategory.href}
                      onClick={handleClose}
                      className="block px-5 py-2.5 text-sm font-medium text-[#007185] hover:text-[#c7511f] hover:underline transition-colors"
                    >
                      See all {activeCategory.name}
                    </Link>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
