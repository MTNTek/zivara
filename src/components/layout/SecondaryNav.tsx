'use client';

import Link from 'next/link';
import { MegaMenu } from './MegaMenu';
import { useState } from 'react';

interface SubCategory {
  name: string;
  href: string;
}

interface Category {
  name: string;
  href: string;
  subcategories: SubCategory[];
  showProducts?: boolean;
}

const categories: Category[] = [
  {
    name: 'Electronics',
    href: '/products/category/electronics',
    showProducts: true,
    subcategories: [
      { name: 'Smartphones & Accessories', href: '/products/category/electronics' },
      { name: 'Laptops & Computers', href: '/products/category/electronics' },
      { name: 'Headphones & Audio', href: '/products/category/electronics' },
      { name: 'TV & Home Theater', href: '/products/category/electronics' },
      { name: 'Gaming', href: '/products/category/electronics' },
      { name: 'Smart Home', href: '/products/category/electronics' },
      { name: 'Cameras & Photography', href: '/products/category/electronics' },
      { name: 'Wearables', href: '/products/category/electronics' },
    ],
  },
  {
    name: "Men's Fashion",
    href: '/products/category/mens-fashion',
    subcategories: [
      { name: 'Clothing', href: '/products/category/mens-fashion' },
      { name: 'Shoes', href: '/products/category/mens-fashion' },
      { name: 'Watches', href: '/products/category/mens-fashion' },
      { name: 'Accessories', href: '/products/category/mens-fashion' },
    ],
  },
  {
    name: "Women's Fashion",
    href: '/products/category/womens-fashion',
    subcategories: [
      { name: 'Clothing', href: '/products/category/womens-fashion' },
      { name: 'Shoes', href: '/products/category/womens-fashion' },
      { name: 'Handbags', href: '/products/category/womens-fashion' },
      { name: 'Jewelry', href: '/products/category/womens-fashion' },
    ],
  },
  {
    name: 'Home & Kitchen',
    href: '/products/category/home-kitchen',
    subcategories: [
      { name: 'Furniture', href: '/products/category/home-kitchen' },
      { name: 'Kitchen Appliances', href: '/products/category/home-kitchen' },
      { name: 'Bedding', href: '/products/category/home-kitchen' },
      { name: 'Home Decor', href: '/products/category/home-kitchen' },
      { name: 'Lighting', href: '/products/category/home-kitchen' },
    ],
  },
  {
    name: 'Beauty & Health',
    href: '/products/category/beauty-health',
    subcategories: [
      { name: 'Skincare', href: '/products/category/beauty-health' },
      { name: 'Makeup', href: '/products/category/beauty-health' },
      { name: 'Haircare', href: '/products/category/beauty-health' },
      { name: 'Fragrances', href: '/products/category/beauty-health' },
    ],
  },
  {
    name: 'Sports & Outdoors',
    href: '/products/category/sports-outdoors',
    subcategories: [
      { name: 'Exercise & Fitness', href: '/products/category/sports-outdoors' },
      { name: 'Outdoor Recreation', href: '/products/category/sports-outdoors' },
      { name: 'Cycling', href: '/products/category/sports-outdoors' },
    ],
  },
  {
    name: 'Toys & Games',
    href: '/products/category/toys-games',
    subcategories: [
      { name: 'Board Games', href: '/products/category/toys-games' },
      { name: 'Building Toys', href: '/products/category/toys-games' },
      { name: 'Educational Toys', href: '/products/category/toys-games' },
    ],
  },
  {
    name: 'Books',
    href: '/products/category/books',
    subcategories: [
      { name: 'Fiction', href: '/products/category/books' },
      { name: 'Non-Fiction', href: '/products/category/books' },
    ],
  },
  {
    name: 'Automotive',
    href: '/products/category/automotive',
    subcategories: [
      { name: 'Car Accessories', href: '/products/category/automotive' },
      { name: 'Car Electronics', href: '/products/category/automotive' },
      { name: 'Tools & Equipment', href: '/products/category/automotive' },
    ],
  },
  {
    name: 'Pet Supplies',
    href: '/products/category/pet-supplies',
    subcategories: [
      { name: 'Dog Supplies', href: '/products/category/pet-supplies' },
      { name: 'Cat Supplies', href: '/products/category/pet-supplies' },
    ],
  },
  {
    name: 'Office Products',
    href: '/products/category/office-products',
    subcategories: [
      { name: 'Office Supplies', href: '/products/category/office-products' },
      { name: 'Office Furniture', href: '/products/category/office-products' },
    ],
  },
  {
    name: 'Garden',
    href: '/products/category/garden',
    subcategories: [
      { name: 'Gardening Tools', href: '/products/category/garden' },
      { name: 'Outdoor Furniture', href: '/products/category/garden' },
    ],
  },
];

export function SecondaryNav() {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  return (
    <>
      {/* Desktop Secondary Navigation */}
      <div className="bg-blue-800 hidden md:block">
        <div className="w-full px-4">
          <nav className="flex items-center gap-6 h-10 text-sm relative" aria-label="Main navigation">
            <MegaMenu />
            {categories.map((category) => (
              <div
                key={category.name}
                className="relative"
                onMouseEnter={() => setHoveredCategory(category.name)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <Link href={category.href} className="text-white px-2 py-1 transition-colors whitespace-nowrap block">
                  {category.name}
                </Link>
                
                {/* Dropdown Menu */}
                {hoveredCategory === category.name && (
                  <div className="absolute left-0 top-full mt-0 bg-white shadow-lg z-50 border border-gray-200 rounded-b-md">
                    {category.showProducts ? (
                      // Electronics - Amazon style: just subcategory names in columns
                      <div className="py-3 px-4 grid grid-cols-3 gap-x-8 min-w-[700px]">
                        {category.subcategories.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className="block py-1.5 text-sm text-gray-700 hover:text-[#0018f9] hover:underline"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      // Other categories - simple list
                      <div className="py-2 w-56">
                        {category.subcategories.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="bg-blue-800 md:hidden">
        <div className="w-full px-4">
          <div className="py-2">
            <MegaMenu />
          </div>
        </div>
      </div>
    </>
  );
}
