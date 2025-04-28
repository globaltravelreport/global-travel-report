'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { twMerge } from 'tailwind-merge';

const countries = [
  'Australia', 'France', 'Japan', 'Italy', 'Spain', 'United States',
  'United Kingdom', 'Germany', 'Thailand', 'Singapore', 'Maldives',
  'Africa', 'Europe', 'Asia', 'Global'
].sort();

const categories = [
  'Hotels', 'Airlines', 'Cruises', 'Destinations', 'Tours',
  'Finance', 'Travel Tips', 'Food & Dining', 'Adventure'
].sort();

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCountriesOpen, setIsCountriesOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setIsCountriesOpen(false);
        setIsCategoriesOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-blue-600">Global Travel Report</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className={twMerge(
              "text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium",
              pathname === '/' && "text-blue-600"
            )}>
              Home
            </Link>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsCountriesOpen(!isCountriesOpen)}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                aria-expanded="false"
                aria-controls="countries-menu"
                aria-label="Open countries menu"
              >
                Countries
              </button>
              {isCountriesOpen && (
                <div id="countries-menu" className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1 max-h-96 overflow-y-auto">
                    {countries.map((country) => (
                      <Link
                        key={country}
                        href={`/countries/${country.toLowerCase().replace(/\s+/g, '-')}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {country}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                aria-expanded="false"
                aria-controls="categories-menu"
                aria-label="Open categories menu"
              >
                Categories
              </button>
              {isCategoriesOpen && (
                <div id="categories-menu" className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1 max-h-96 overflow-y-auto">
                    {categories.map((category) => (
                      <Link
                        key={category}
                        href={`/categories/${category.toLowerCase().replace(/\s+/g, '-')}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {category}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Link href="/about" className={twMerge(
              "text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium",
              pathname === '/about' && "text-blue-600"
            )}>
              About
            </Link>
            <Link href="/contact" className={twMerge(
              "text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium",
              pathname === '/contact' && "text-blue-600"
            )}>
              Contact
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Search stories"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600"
                aria-label="Submit search"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600"
              aria-expanded="false"
              aria-controls="mobile-menu"
              aria-label="Toggle mobile menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div id="mobile-menu" className="md:hidden" ref={menuRef}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600">
              Home
            </Link>
            <button
              onClick={() => setIsCountriesOpen(!isCountriesOpen)}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600"
              aria-expanded="false"
              aria-controls="mobile-countries-menu"
              aria-label="Open countries menu"
            >
              Countries
            </button>
            {isCountriesOpen && (
              <div id="mobile-countries-menu" className="pl-4 space-y-1">
                {countries.map((country) => (
                  <Link
                    key={country}
                    href={`/countries/${country.toLowerCase().replace(/\s+/g, '-')}`}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600"
                  >
                    {country}
                  </Link>
                ))}
              </div>
            )}
            <button
              onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600"
              aria-expanded="false"
              aria-controls="mobile-categories-menu"
              aria-label="Open categories menu"
            >
              Categories
            </button>
            {isCategoriesOpen && (
              <div id="mobile-categories-menu" className="pl-4 space-y-1">
                {categories.map((category) => (
                  <Link
                    key={category}
                    href={`/categories/${category.toLowerCase().replace(/\s+/g, '-')}`}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600"
                  >
                    {category}
                  </Link>
                ))}
              </div>
            )}
            <Link href="/about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600">
              About
            </Link>
            <Link href="/contact" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600">
              Contact
            </Link>
          </div>
          {/* Mobile search */}
          <div className="px-4 py-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Search stories"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600"
                aria-label="Submit search"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
} 