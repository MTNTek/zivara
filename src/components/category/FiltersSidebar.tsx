'use client';

import { useState } from 'react';

interface FiltersSidebarProps {
  onFilterChange?: (filters: any) => void;
}

export function FiltersSidebar({ onFilterChange }: FiltersSidebarProps) {
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedDiscount, setSelectedDiscount] = useState<string | null>(null);

  const brands = ['Apple', 'Samsung', 'Sony', 'Dell', 'HP', 'Lenovo', 'Canon', 'Nikon', 'Bose', 'JBL'];
  const discounts = ['10% or more', '20% or more', '30% or more', '40% or more', '50% or more'];

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  return (
    <div className="w-64 bg-white border border-gray-200 rounded-lg p-4 h-fit sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg">Filters</h2>
        <button className="text-sm text-blue-600 hover:underline">Clear All</button>
      </div>

      {/* Brand Filter */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <h3 className="font-semibold text-sm mb-3">Brand</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {brands.map((brand) => (
            <label key={brand} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleBrand(brand)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <h3 className="font-semibold text-sm mb-3">Price Range</h3>
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max="5000"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">${priceRange[0]}</span>
            <span className="text-gray-600">${priceRange[1]}</span>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
            <input
              type="number"
              placeholder="Max"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 5000])}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <h3 className="font-semibold text-sm mb-3">Customer Rating</h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
              <input
                type="radio"
                name="rating"
                checked={selectedRating === rating}
                onChange={() => setSelectedRating(rating)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div className="ml-2 flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-1 text-sm text-gray-600">& Up</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Discount Filter */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <h3 className="font-semibold text-sm mb-3">Discount</h3>
        <div className="space-y-2">
          {discounts.map((discount) => (
            <label key={discount} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
              <input
                type="radio"
                name="discount"
                checked={selectedDiscount === discount}
                onChange={() => setSelectedDiscount(discount)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{discount}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Delivery Options */}
      <div className="mb-4">
        <h3 className="font-semibold text-sm mb-3">Delivery Options</h3>
        <div className="space-y-2">
          <label className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Express Delivery</span>
          </label>
          <label className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Free Shipping</span>
          </label>
        </div>
      </div>
    </div>
  );
}
