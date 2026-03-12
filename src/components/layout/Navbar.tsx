'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedLocation, setSelectedLocation] = useState('United States');
  const [locationSearch, setLocationSearch] = useState('');
  const router = useRouter();

  const categories = [
    { value: 'all', label: 'All Departments' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'home', label: 'Home & Kitchen' },
    { value: 'books', label: 'Books' },
    { value: 'sports', label: 'Sports & Outdoors' },
    { value: 'beauty', label: 'Beauty & Health' },
    { value: 'toys', label: 'Toys & Games' },
    { value: 'automotive', label: 'Automotive' },
  ];

  const languages = [
    { code: 'EN', name: 'English', flag: '🇺🇸' },
    { code: 'ES', name: 'Español', flag: '🇪🇸' },
    { code: 'FR', name: 'Français', flag: '🇫🇷' },
    { code: 'DE', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'IT', name: 'Italiano', flag: '🇮🇹' },
    { code: 'PT', name: 'Português', flag: '🇵🇹' },
    { code: 'ZH', name: '中文', flag: '🇨🇳' },
    { code: 'JA', name: '日本語', flag: '🇯🇵' },
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];

  const popularLocations = [
    { name: 'New York, NY', country: 'United States' },
    { name: 'Los Angeles, CA', country: 'United States' },
    { name: 'London', country: 'United Kingdom' },
    { name: 'Paris', country: 'France' },
    { name: 'Dubai', country: 'United Arab Emirates' },
    { name: 'Tokyo', country: 'Japan' },
    { name: 'Singapore', country: 'Singapore' },
    { name: 'Sydney', country: 'Australia' },
  ];

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    setIsLocationOpen(false);
    setLocationSearch('');
  };

  const trendingSearches = [
    { text: 'iPhone 15 Pro', icon: '📱', category: 'Electronics' },
    { text: 'Nike Air Max', icon: '👟', category: 'Fashion' },
    { text: 'PlayStation 5', icon: '🎮', category: 'Gaming' },
    { text: 'Samsung TV', icon: '📺', category: 'Electronics' },
    { text: 'Laptop Backpack', icon: '🎒', category: 'Accessories' },
    { text: 'Wireless Headphones', icon: '🎧', category: 'Electronics' },
    { text: 'Smart Watch', icon: '⌚', category: 'Electronics' },
    { text: 'Coffee Maker', icon: '☕', category: 'Home & Kitchen' },
    { text: 'Yoga Mat', icon: '🧘', category: 'Sports' },
    { text: 'LED Desk Lamp', icon: '💡', category: 'Home & Kitchen' },
  ];

  const handleTrendingClick = (searchText: string) => {
    setSearchQuery(searchText);
    setIsSearchFocused(false);
    router.push(`/products?search=${encodeURIComponent(searchText)}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const categoryParam = selectedCategory !== 'all' ? `&category=${selectedCategory}` : '';
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}${categoryParam}`);
    }
  };

  const selectedCategoryLabel = categories.find(cat => cat.value === selectedCategory)?.label || 'All';

  return (
    <div className="bg-blue-600 text-white">
      <div className="w-full flex items-center gap-2 px-4 py-4">
        {/* Logo - Left Side */}
        <Link href="/" className="text-3xl font-bold cursor-pointer transition-colors whitespace-nowrap flex-shrink-0">
          Zivara
        </Link>

        {/* Delivery Address */}
        <button 
          onClick={() => setIsLocationOpen(true)}
          className="text-xs cursor-pointer px-2 py-1 transition-colors hidden lg:flex items-start gap-1 flex-shrink-0"
        >
          <svg className="w-4 h-4 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div className="text-left">
            <div className="text-[10px] text-gray-300">Deliver to</div>
            <div className="font-bold text-xs">{selectedLocation}</div>
          </div>
        </button>

        {/* Location Modal - Noon Style */}
        {isLocationOpen && (
          <>
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-20" onClick={() => setIsLocationOpen(false)}>
              <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex h-[600px]">
                  {/* Left Side - Location Selection */}
                  <div className="w-1/2 p-6 overflow-y-auto border-r border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">Choose your location</h2>
                      <button 
                        onClick={() => setIsLocationOpen(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Search Input */}
                    <div className="mb-6">
                      <div className="relative">
                        <input
                          type="text"
                          value={locationSearch}
                          onChange={(e) => setLocationSearch(e.target.value)}
                          placeholder="Search for area, street name..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900"
                        />
                        <svg className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>

                    {/* Use Current Location */}
                    <button 
                      onClick={() => handleLocationSelect('Current Location')}
                      className="w-full flex items-center gap-3 p-4 mb-4 border border-blue-600 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z" />
                      </svg>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">Use my current location</div>
                        <div className="text-sm text-gray-500">Using GPS</div>
                      </div>
                    </button>

                    {/* Popular Locations */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Popular Locations</h3>
                      <div className="space-y-2">
                        {popularLocations
                          .filter(loc => 
                            locationSearch === '' || 
                            loc.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
                            loc.country.toLowerCase().includes(locationSearch.toLowerCase())
                          )
                          .map((location, index) => (
                            <button
                              key={index}
                              onClick={() => handleLocationSelect(location.name)}
                              className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                            >
                              <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <div>
                                <div className="font-medium text-gray-900">{location.name}</div>
                                <div className="text-sm text-gray-500">{location.country}</div>
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Map Placeholder */}
                  <div className="w-1/2 bg-gray-100 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <p className="text-gray-500 text-sm">Map View</p>
                        <p className="text-gray-400 text-xs mt-1">Select a location to view on map</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Search Bar with Category Dropdown - Expanded */}
        <form onSubmit={handleSearch} className="flex-1 flex relative">
          {/* Category Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="h-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 rounded-l-md transition-colors flex items-center gap-1 whitespace-nowrap text-xs border-r border-gray-300"
            >
              <span className="hidden sm:inline">{selectedCategoryLabel}</span>
              <span className="sm:hidden">All</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isCategoryOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsCategoryOpen(false)} />
                <div className="absolute left-0 top-full mt-1 bg-white shadow-lg z-50 w-56 border border-gray-200 rounded-md max-h-96 overflow-y-auto">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(category.value);
                        setIsCategoryOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                        selectedCategory === category.value ? 'bg-gray-100 font-semibold' : 'text-gray-700'
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Search Input - Expanded */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className="flex-1 min-w-0 px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Search products..."
          />

          {/* Trending Searches Dropdown */}
          {isSearchFocused && searchQuery === '' && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white shadow-lg z-50 border border-gray-200 rounded-md max-h-96 overflow-y-auto">
              <div className="p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                  Top Trending
                </h3>
                <div className="space-y-1">
                  {trendingSearches.map((item, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleTrendingClick(item.text)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                          {item.text}
                        </div>
                        <div className="text-xs text-gray-500">{item.category}</div>
                      </div>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Search Button */}
          <button 
            type="submit"
            className="bg-orange-400 hover:bg-orange-500 px-4 rounded-r-md transition-colors text-blue-800 flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>

        {/* Language & Currency Selector */}
        <div className="relative flex-shrink-0 hidden md:block">
          <button
            onClick={() => setIsLanguageOpen(!isLanguageOpen)}
            className="text-xs cursor-pointer px-2 py-1 transition-colors flex items-center gap-1"
          >
            <span className="text-lg">🌐</span>
            <span className="font-bold">{selectedLanguage}</span>
            <span className="text-[10px]">({selectedCurrency})</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Language & Currency Dropdown */}
          {isLanguageOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsLanguageOpen(false)} />
              <div className="absolute right-0 top-full mt-1 bg-white shadow-lg z-50 w-64 border border-gray-200 rounded-md max-h-96 overflow-y-auto">
                {/* Language Section */}
                <div className="p-3 border-b border-gray-200">
                  <h3 className="text-xs font-bold text-gray-900 mb-2">Language</h3>
                  <div className="space-y-1">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setSelectedLanguage(lang.code);
                          setIsLanguageOpen(false);
                        }}
                        className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors rounded ${
                          selectedLanguage === lang.code ? 'bg-gray-100 font-semibold' : 'text-gray-700'
                        }`}
                      >
                        <span className="mr-2">{lang.flag}</span>
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Currency Section */}
                <div className="p-3">
                  <h3 className="text-xs font-bold text-gray-900 mb-2">Currency</h3>
                  <div className="grid grid-cols-3 gap-1">
                    {currencies.map((currency) => (
                      <button
                        key={currency}
                        onClick={() => {
                          setSelectedCurrency(currency);
                          setIsLanguageOpen(false);
                        }}
                        className={`px-2 py-1.5 text-xs hover:bg-gray-100 transition-colors rounded ${
                          selectedCurrency === currency ? 'bg-gray-100 font-semibold' : 'text-gray-700'
                        }`}
                      >
                        {currency}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Account */}
        <Link href="/profile" className="text-xs cursor-pointer px-2 py-1 transition-colors whitespace-nowrap hidden md:block flex-shrink-0">
          <div className="text-[10px]">Hello, Sign in</div>
          <div className="font-bold">Account</div>
        </Link>

        {/* Orders */}
        <Link href="/orders" className="text-xs cursor-pointer px-2 py-1 transition-colors whitespace-nowrap hidden lg:block flex-shrink-0">
          <div className="text-[10px]">Returns</div>
          <div className="font-bold">& Orders</div>
        </Link>

        {/* Cart */}
        <Link href="/cart" className="text-sm font-bold cursor-pointer px-2 py-1 transition-colors whitespace-nowrap flex-shrink-0">
          🛒 Cart
        </Link>
      </div>
    </div>
  );
}
