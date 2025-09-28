'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CATEGORIES } from '@/src/config/categories';
import { getUniqueCountries } from '@/src/utils/stories';

interface Country {
  name: string;
  slug: string;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isDestinationsOpen, setIsDestinationsOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const uniqueCountries = await getUniqueCountries();
        const countryData = uniqueCountries.map(country => ({
          name: country,
          slug: country.toLowerCase().replace(/\s+/g, '-')
        }));
        setCountries(countryData);
      } catch (error) {
        console.error('Error loading countries:', error);
      }
    };

    loadCountries();
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsDestinationsOpen(false);
    setIsCategoriesOpen(false);
  }, [pathname]);

  const featuredCategories = CATEGORIES.filter(cat => cat.featured);
  const destinationCategories = CATEGORIES.filter(cat => cat.slug === 'destinations');
  const travelStyleCategories = CATEGORIES.filter(cat =>
    ['luxury-travel', 'budget-travel', 'family-travel', 'solo-travel'].includes(cat.slug)
  );

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">Global Travel Report</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {/* Home */}
            <Link
              href="/"
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                pathname === '/'
                  ? 'text-[#C9A14A] border-b-2 border-[#C9A14A]'
                  : 'text-gray-700 hover:text-[#C9A14A]'
              }`}
            >
              Home
            </Link>

            {/* Destinations Mega Menu */}
            <div
              className="relative"
              onMouseEnter={() => setIsDestinationsOpen(true)}
              onMouseLeave={() => setIsDestinationsOpen(false)}
            >
              <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#C9A14A] transition-colors flex items-center">
                Destinations
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Destinations Mega Menu */}
              {isDestinationsOpen && (
                <div className="absolute top-full left-0 w-96 bg-white border border-gray-200 shadow-lg rounded-lg py-4 mt-1">
                  <div className="px-4 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Popular Destinations</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {countries.slice(0, 10).map((country) => (
                        <Link
                          key={country.slug}
                          href={`/countries/${country.slug}`}
                          className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#C9A14A] rounded"
                        >
                          {country.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-4 px-4">
                    <Link
                      href="/destinations"
                      className="block text-sm text-[#C9A14A] hover:text-[#B89038] font-medium"
                    >
                      View All Destinations →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Categories Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsCategoriesOpen(true)}
              onMouseLeave={() => setIsCategoriesOpen(false)}
            >
              <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#C9A14A] transition-colors flex items-center">
                Categories
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Categories Dropdown */}
              {isCategoriesOpen && (
                <div className="absolute top-full left-0 w-64 bg-white border border-gray-200 shadow-lg rounded-lg py-2 mt-1">
                  {featuredCategories.map((category) => (
                    <Link
                      key={category.slug}
                      href={`/categories/${category.slug}`}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#C9A14A]"
                    >
                      <span className="text-lg mr-3">{category.icon}</span>
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-xs text-gray-500">{category.description}</div>
                      </div>
                    </Link>
                  ))}
                  <div className="border-t border-gray-100 mt-2 pt-2 px-4">
                    <Link
                      href="/categories"
                      className="block text-sm text-[#C9A14A] hover:text-[#B89038] font-medium"
                    >
                      View All Categories →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Archive */}
            <Link
              href="/archive"
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                pathname === '/archive'
                  ? 'text-[#C9A14A] border-b-2 border-[#C9A14A]'
                  : 'text-gray-700 hover:text-[#C9A14A]'
              }`}
            >
              Archive
            </Link>

            {/* Stories */}
            <Link
              href="/stories"
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                pathname === '/stories'
                  ? 'text-[#C9A14A] border-b-2 border-[#C9A14A]'
                  : 'text-gray-700 hover:text-[#C9A14A]'
              }`}
            >
              All Stories
            </Link>
          </nav>

          {/* Search and Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <Link
              href="/search"
              className="hidden sm:block p-2 text-gray-600 hover:text-[#C9A14A] transition-colors"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-[#C9A14A] transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-2">
            {/* Main Navigation */}
            <Link
              href="/"
              className={`block px-3 py-2 text-base font-medium rounded-md transition-colors ${
                pathname === '/' ? 'bg-[#C9A14A] text-white' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Home
            </Link>

            {/* Destinations Accordion */}
            <div>
              <button
                onClick={() => setIsDestinationsOpen(!isDestinationsOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                Destinations
                <svg
                  className={`w-4 h-4 transition-transform ${isDestinationsOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isDestinationsOpen && (
                <div className="mt-2 ml-4 space-y-1">
                  {countries.slice(0, 8).map((country) => (
                    <Link
                      key={country.slug}
                      href={`/countries/${country.slug}`}
                      className="block px-3 py-2 text-sm text-gray-600 hover:text-[#C9A14A] hover:bg-gray-50 rounded"
                    >
                      {country.name}
                    </Link>
                  ))}
                  <Link
                    href="/destinations"
                    className="block px-3 py-2 text-sm text-[#C9A14A] hover:text-[#B89038] font-medium"
                  >
                    View All Destinations →
                  </Link>
                </div>
              )}
            </div>

            {/* Categories Accordion */}
            <div>
              <button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                Categories
                <svg
                  className={`w-4 h-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isCategoriesOpen && (
                <div className="mt-2 ml-4 space-y-1">
                  {featuredCategories.map((category) => (
                    <Link
                      key={category.slug}
                      href={`/categories/${category.slug}`}
                      className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-[#C9A14A] hover:bg-gray-50 rounded"
                    >
                      <span className="text-lg mr-3">{category.icon}</span>
                      {category.name}
                    </Link>
                  ))}
                  <Link
                    href="/categories"
                    className="block px-3 py-2 text-sm text-[#C9A14A] hover:text-[#B89038] font-medium"
                  >
                    View All Categories →
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/archive"
              className={`block px-3 py-2 text-base font-medium rounded-md transition-colors ${
                pathname === '/archive' ? 'bg-[#C9A14A] text-white' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Archive
            </Link>

            <Link
              href="/stories"
              className={`block px-3 py-2 text-base font-medium rounded-md transition-colors ${
                pathname === '/stories' ? 'bg-[#C9A14A] text-white' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Stories
            </Link>

            <Link
              href="/search"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
            >
              Search
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
