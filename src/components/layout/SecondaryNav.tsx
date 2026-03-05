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
}

const categories: Category[] = [
  {
    name: 'Electronics',
    href: '/products?category=electronics',
    subcategories: [
      { name: 'Smartphones', href: '/products?category=electronics&sub=smartphones' },
      { name: 'Laptops & Computers', href: '/products?category=electronics&sub=laptops' },
      { name: 'Tablets', href: '/products?category=electronics&sub=tablets' },
      { name: 'Cameras', href: '/products?category=electronics&sub=cameras' },
      { name: 'Headphones', href: '/products?category=electronics&sub=headphones' },
      { name: 'Smart Watches', href: '/products?category=electronics&sub=smartwatches' },
      { name: 'Gaming Consoles', href: '/products?category=electronics&sub=gaming' },
      { name: 'TV & Audio', href: '/products?category=electronics&sub=tv-audio' },
    ],
  },
  {
    name: "Men's Fashion",
    href: '/products?category=fashion&gender=men',
    subcategories: [
      { name: 'Clothing', href: '/products?category=fashion&gender=men&sub=clothing' },
      { name: 'Shoes', href: '/products?category=fashion&gender=men&sub=shoes' },
      { name: 'Watches', href: '/products?category=fashion&gender=men&sub=watches' },
      { name: 'Accessories', href: '/products?category=fashion&gender=men&sub=accessories' },
      { name: 'Bags', href: '/products?category=fashion&gender=men&sub=bags' },
      { name: 'Sunglasses', href: '/products?category=fashion&gender=men&sub=sunglasses' },
    ],
  },
  {
    name: "Women's Fashion",
    href: '/products?category=fashion&gender=women',
    subcategories: [
      { name: 'Clothing', href: '/products?category=fashion&gender=women&sub=clothing' },
      { name: 'Shoes', href: '/products?category=fashion&gender=women&sub=shoes' },
      { name: 'Handbags', href: '/products?category=fashion&gender=women&sub=handbags' },
      { name: 'Jewelry', href: '/products?category=fashion&gender=women&sub=jewelry' },
      { name: 'Watches', href: '/products?category=fashion&gender=women&sub=watches' },
      { name: 'Accessories', href: '/products?category=fashion&gender=women&sub=accessories' },
      { name: 'Sunglasses', href: '/products?category=fashion&gender=women&sub=sunglasses' },
    ],
  },
  {
    name: 'Home & Kitchen',
    href: '/products?category=home',
    subcategories: [
      { name: 'Furniture', href: '/products?category=home&sub=furniture' },
      { name: 'Kitchen Appliances', href: '/products?category=home&sub=kitchen-appliances' },
      { name: 'Cookware', href: '/products?category=home&sub=cookware' },
      { name: 'Bedding', href: '/products?category=home&sub=bedding' },
      { name: 'Home Decor', href: '/products?category=home&sub=decor' },
      { name: 'Storage & Organization', href: '/products?category=home&sub=storage' },
      { name: 'Lighting', href: '/products?category=home&sub=lighting' },
    ],
  },
  {
    name: 'Beauty & Health',
    href: '/products?category=beauty',
    subcategories: [
      { name: 'Skincare', href: '/products?category=beauty&sub=skincare' },
      { name: 'Makeup', href: '/products?category=beauty&sub=makeup' },
      { name: 'Haircare', href: '/products?category=beauty&sub=haircare' },
      { name: 'Fragrances', href: '/products?category=beauty&sub=fragrances' },
      { name: 'Personal Care', href: '/products?category=beauty&sub=personal-care' },
      { name: 'Health Supplements', href: '/products?category=beauty&sub=supplements' },
    ],
  },
  {
    name: 'Sports & Outdoors',
    href: '/products?category=sports',
    subcategories: [
      { name: 'Exercise & Fitness', href: '/products?category=sports&sub=fitness' },
      { name: 'Outdoor Recreation', href: '/products?category=sports&sub=outdoor' },
      { name: 'Sports Equipment', href: '/products?category=sports&sub=equipment' },
      { name: 'Cycling', href: '/products?category=sports&sub=cycling' },
      { name: 'Camping & Hiking', href: '/products?category=sports&sub=camping' },
      { name: 'Water Sports', href: '/products?category=sports&sub=water-sports' },
    ],
  },
  {
    name: 'Toys & Games',
    href: '/products?category=toys',
    subcategories: [
      { name: 'Action Figures', href: '/products?category=toys&sub=action-figures' },
      { name: 'Dolls & Accessories', href: '/products?category=toys&sub=dolls' },
      { name: 'Building Toys', href: '/products?category=toys&sub=building' },
      { name: 'Board Games', href: '/products?category=toys&sub=board-games' },
      { name: 'Educational Toys', href: '/products?category=toys&sub=educational' },
      { name: 'Outdoor Play', href: '/products?category=toys&sub=outdoor-play' },
    ],
  },
  {
    name: 'Books',
    href: '/products?category=books',
    subcategories: [
      { name: 'Fiction', href: '/products?category=books&sub=fiction' },
      { name: 'Non-Fiction', href: '/products?category=books&sub=non-fiction' },
      { name: 'Children\'s Books', href: '/products?category=books&sub=children' },
      { name: 'Educational', href: '/products?category=books&sub=educational' },
      { name: 'Comics & Manga', href: '/products?category=books&sub=comics' },
      { name: 'Magazines', href: '/products?category=books&sub=magazines' },
    ],
  },
  {
    name: 'Automotive',
    href: '/products?category=automotive',
    subcategories: [
      { name: 'Car Accessories', href: '/products?category=automotive&sub=accessories' },
      { name: 'Car Electronics', href: '/products?category=automotive&sub=electronics' },
      { name: 'Tools & Equipment', href: '/products?category=automotive&sub=tools' },
      { name: 'Car Care', href: '/products?category=automotive&sub=care' },
      { name: 'Motorcycle Accessories', href: '/products?category=automotive&sub=motorcycle' },
    ],
  },
  {
    name: 'Pet Supplies',
    href: '/products?category=pets',
    subcategories: [
      { name: 'Dog Supplies', href: '/products?category=pets&sub=dogs' },
      { name: 'Cat Supplies', href: '/products?category=pets&sub=cats' },
      { name: 'Pet Food', href: '/products?category=pets&sub=food' },
      { name: 'Pet Toys', href: '/products?category=pets&sub=toys' },
      { name: 'Pet Health', href: '/products?category=pets&sub=health' },
    ],
  },
  {
    name: 'Office Products',
    href: '/products?category=office',
    subcategories: [
      { name: 'Office Supplies', href: '/products?category=office&sub=supplies' },
      { name: 'Office Furniture', href: '/products?category=office&sub=furniture' },
      { name: 'Printers & Ink', href: '/products?category=office&sub=printers' },
      { name: 'Office Electronics', href: '/products?category=office&sub=electronics' },
      { name: 'School Supplies', href: '/products?category=office&sub=school' },
    ],
  },
  {
    name: 'Garden',
    href: '/products?category=garden',
    subcategories: [
      { name: 'Gardening Tools', href: '/products?category=garden&sub=tools' },
      { name: 'Plants & Seeds', href: '/products?category=garden&sub=plants' },
      { name: 'Outdoor Furniture', href: '/products?category=garden&sub=furniture' },
      { name: 'Garden Decor', href: '/products?category=garden&sub=decor' },
      { name: 'Lawn Care', href: '/products?category=garden&sub=lawn-care' },
    ],
  },
];

export function SecondaryNav() {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  return (
    <>
      {/* Desktop Secondary Navigation */}
      <div className="bg-[#124179] hidden md:block">
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
                  <div className="absolute left-0 top-full mt-0 bg-white shadow-lg z-50 w-56 border border-gray-200 rounded-b-md">
                    <div className="py-2">
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
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="bg-[#124179] md:hidden">
        <div className="w-full px-4">
          <div className="py-2">
            <MegaMenu />
          </div>
        </div>
      </div>
    </>
  );
}
