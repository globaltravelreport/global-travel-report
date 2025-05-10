'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X, Search, Globe, MapPin } from 'lucide-react';
import Image from 'next/image';
import { CATEGORIES, getFeaturedCategories, getSubcategories, Category } from '@/src/config/categories';
import { cn } from '@/lib/utils';

const countries = [
  'Australia', 'Japan', 'United States', 'United Kingdom', 'France',
  'Italy', 'Spain', 'Germany', 'Canada', 'New Zealand', 'Thailand',
  'Vietnam', 'Singapore', 'Malaysia', 'Indonesia', 'China', 'India',
  'South Africa', 'Brazil', 'Mexico', 'Maldives', 'Africa', 'Europe', 'Asia', 'Global'
].sort();

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [displayCategories, setDisplayCategories] = useState<Category[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize with featured categories
  useEffect(() => {
    setDisplayCategories(getFeaturedCategories());
  }, []);

  const filteredCountries = countries.filter(country =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const filteredCategories = displayCategories.filter(category =>
    category.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const isActive = (path: string) => pathname === path;

  // Close dropdowns when clicking outside
  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      setIsCountryDropdownOpen(false);
      setIsCategoryDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <nav className={cn(
      "sticky top-0 z-50 transition-all duration-300",
      isScrolled
        ? "bg-gradient-to-r from-[#19273A]/95 to-[#2A3F5F]/95 backdrop-blur-md shadow-lg"
        : "bg-gradient-to-r from-[#19273A] to-[#2A3F5F] shadow-md"
    )}>
      {/* Top bar with social links - only visible on desktop */}
      <div className="hidden lg:block border-b border-[#C9A14A]/20">
        <div className="max-w-7xl mx-auto px-4 py-1 flex justify-between items-center">
          <div className="text-[#C9A14A] text-xs">
            <span>Based in Sydney, Australia</span>
          </div>
          <div className="flex items-center space-x-3">
            <a href="https://www.facebook.com/globaltravelreport" target="_blank" rel="noopener noreferrer"
               className="text-[#C9A14A] hover:text-white transition-colors" aria-label="Facebook">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
              </svg>
            </a>
            <a href="https://x.com/GTravelReport" target="_blank" rel="noopener noreferrer"
               className="text-[#C9A14A] hover:text-white transition-colors" aria-label="X (Twitter)">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className={cn(
          "flex items-center justify-between transition-all duration-300",
          isScrolled ? "h-16" : "h-20"
        )}>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className={cn(
              "relative overflow-hidden rounded-full bg-white flex items-center justify-center transition-all duration-300",
              isScrolled ? "h-10 w-10" : "h-12 w-12"
            )}>
              <Image
                src="/logo-gtr.png"
                alt="Global Travel Report Logo"
                width={isScrolled ? 40 : 48}
                height={isScrolled ? 40 : 48}
                className="rounded-none"
                priority
              />
            </div>
            <span className={cn(
              "font-extrabold text-[#C9A14A] tracking-wide transition-all duration-300",
              isScrolled ? "text-xl" : "text-2xl"
            )}>GLOBAL TRAVEL REPORT</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={cn(
                "text-[#C9A14A] hover:text-white transition-colors relative group",
                isActive('/') ? 'font-bold' : ''
              )}
            >
              <span>Home</span>
              <span className={cn(
                "absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full",
                isActive('/') ? 'w-full' : ''
              )}></span>
            </Link>

            {/* Country Dropdown */}
            <div className="relative dropdown-container">
              <button
                className={cn(
                  "flex items-center gap-1 text-[#C9A14A] hover:text-white transition-colors relative group",
                  isActive('/countries') ? 'font-bold' : '',
                  isCountryDropdownOpen ? 'text-white' : ''
                )}
                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                type="button"
                aria-expanded={isCountryDropdownOpen}
                aria-haspopup="true"
              >
                <span className="flex items-center">
                  <Globe className="w-4 h-4 mr-1" />
                  Destinations
                </span>
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  isCountryDropdownOpen ? "rotate-180" : ""
                )} />
                <span className={cn(
                  "absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full",
                  isActive('/countries') || isCountryDropdownOpen ? 'w-full' : ''
                )}></span>
              </button>
              {isCountryDropdownOpen && (
                <div className="absolute top-full left-0 w-72 bg-[#19273A] border border-[#C9A14A]/30 shadow-xl rounded-md mt-2 p-3 z-50 backdrop-blur-lg">
                  <div className="relative mb-3">
                    <input
                      type="text"
                      placeholder="Search destinations..."
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      className="w-full px-3 py-2 pl-9 bg-[#2A3F5F] text-white border border-[#C9A14A]/30 rounded-md focus:outline-none focus:ring-1 focus:ring-[#C9A14A] placeholder-gray-400"
                    />
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  </div>
                  <div className="max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#C9A14A]/20 scrollbar-track-transparent">
                    <div className="grid grid-cols-2 gap-1">
                      {filteredCountries.map((country) => (
                        <Link
                          key={country}
                          href={`/countries/${country.toLowerCase().replace(/\s+/g, '-')}`}
                          className="flex items-center px-3 py-2 text-sm text-[#C9A14A] hover:bg-[#2A3F5F] rounded-md transition-colors"
                          onClick={() => setIsCountryDropdownOpen(false)}
                        >
                          <MapPin className="w-3 h-3 mr-2 flex-shrink-0" />
                          <span className="truncate">{country}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#C9A14A]/20">
                    <Link
                      href="/destinations"
                      className="block w-full text-center px-3 py-2 bg-[#C9A14A]/10 hover:bg-[#C9A14A]/20 text-[#C9A14A] rounded-md transition-colors text-sm font-medium"
                      onClick={() => setIsCountryDropdownOpen(false)}
                    >
                      View All Destinations
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="relative dropdown-container">
              <button
                className={cn(
                  "flex items-center gap-1 text-[#C9A14A] hover:text-white transition-colors relative group",
                  isActive('/categories') ? 'font-bold' : '',
                  isCategoryDropdownOpen ? 'text-white' : ''
                )}
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                type="button"
                aria-expanded={isCategoryDropdownOpen}
                aria-haspopup="true"
              >
                <span>Categories</span>
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  isCategoryDropdownOpen ? "rotate-180" : ""
                )} />
                <span className={cn(
                  "absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full",
                  isActive('/categories') || isCategoryDropdownOpen ? 'w-full' : ''
                )}></span>
              </button>
              {isCategoryDropdownOpen && (
                <div className="absolute top-full left-0 w-72 bg-[#19273A] border border-[#C9A14A]/30 shadow-xl rounded-md mt-2 p-3 z-50 backdrop-blur-lg">
                  <div className="relative mb-3">
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="w-full px-3 py-2 pl-9 bg-[#2A3F5F] text-white border border-[#C9A14A]/30 rounded-md focus:outline-none focus:ring-1 focus:ring-[#C9A14A] placeholder-gray-400"
                    />
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  </div>
                  <div className="max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#C9A14A]/20 scrollbar-track-transparent">
                    <div className="grid grid-cols-1 gap-1">
                      {filteredCategories.map((category) => (
                        <Link
                          key={category.slug}
                          href={`/categories/${category.slug}`}
                          className="flex items-center px-3 py-2 text-sm text-[#C9A14A] hover:bg-[#2A3F5F] rounded-md transition-colors"
                          onClick={() => setIsCategoryDropdownOpen(false)}
                        >
                          <span className="mr-3 text-xl">{category.icon}</span>
                          <span>{category.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#C9A14A]/20">
                    <Link
                      href="/categories"
                      className="block w-full text-center px-3 py-2 bg-[#C9A14A]/10 hover:bg-[#C9A14A]/20 text-[#C9A14A] rounded-md transition-colors text-sm font-medium"
                      onClick={() => setIsCategoryDropdownOpen(false)}
                    >
                      View All Categories
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/about"
              className={cn(
                "text-[#C9A14A] hover:text-white transition-colors relative group",
                isActive('/about') ? 'font-bold' : ''
              )}
            >
              <span>About</span>
              <span className={cn(
                "absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full",
                isActive('/about') ? 'w-full' : ''
              )}></span>
            </Link>

            <Link
              href="/contact"
              className={cn(
                "text-[#C9A14A] hover:text-white transition-colors relative group",
                isActive('/contact') ? 'font-bold' : ''
              )}
            >
              <span>Contact</span>
              <span className={cn(
                "absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full",
                isActive('/contact') ? 'w-full' : ''
              )}></span>
            </Link>

            {/* Search Button */}
            <button
              type="button"
              className="text-[#C9A14A] hover:text-white transition-colors p-1 rounded-full hover:bg-[#2A3F5F]"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[#C9A14A] hover:text-white p-2 rounded-md hover:bg-[#2A3F5F] transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            type="button"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#C9A14A]/20 animate-fadeIn">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className={cn(
                  "text-[#C9A14A] hover:text-white transition-colors flex items-center",
                  isActive('/') ? 'font-bold' : ''
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="mr-2">🏠</span>
                Home
              </Link>

              <div className="space-y-2">
                <button
                  className="w-full flex items-center justify-between text-[#C9A14A] hover:text-white transition-colors"
                  onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                  type="button"
                >
                  <span className="flex items-center">
                    <Globe className="w-4 h-4 mr-2" />
                    Destinations
                  </span>
                  <ChevronDown className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    isCountryDropdownOpen ? "rotate-180" : ""
                  )} />
                </button>
                {isCountryDropdownOpen && (
                  <div className="pl-4 space-y-2 mt-2 border-l-2 border-[#C9A14A]/20">
                    <div className="relative mb-3">
                      <input
                        type="text"
                        placeholder="Search destinations..."
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        className="w-full px-3 py-2 pl-9 bg-[#2A3F5F] text-white border border-[#C9A14A]/30 rounded-md focus:outline-none focus:ring-1 focus:ring-[#C9A14A] placeholder-gray-400"
                      />
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    </div>
                    <div className="space-y-1">
                      {filteredCountries.map((country) => (
                        <Link
                          key={country}
                          href={`/countries/${country.toLowerCase().replace(/\s+/g, '-')}`}
                          className="flex items-center px-3 py-2 text-sm text-[#C9A14A] hover:bg-[#2A3F5F] rounded-md transition-colors"
                          onClick={() => {
                            setIsCountryDropdownOpen(false);
                            setIsMenuOpen(false);
                          }}
                        >
                          <MapPin className="w-3 h-3 mr-2 flex-shrink-0" />
                          <span className="truncate">{country}</span>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href="/destinations"
                      className="block w-full text-center px-3 py-2 mt-2 bg-[#C9A14A]/10 hover:bg-[#C9A14A]/20 text-[#C9A14A] rounded-md transition-colors text-sm font-medium"
                      onClick={() => {
                        setIsCountryDropdownOpen(false);
                        setIsMenuOpen(false);
                      }}
                    >
                      View All Destinations
                    </Link>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Link
                    href="/categories"
                    className={`text-[#C9A14A] hover:text-white transition-colors ${isActive('/categories') ? 'font-bold underline' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Categories
                  </Link>
                  <button
                    className="text-gray-400 hover:text-[#C9A14A] transition-colors"
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    type="button"
                    aria-label="Show category dropdown"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                {isCategoryDropdownOpen && (
                  <div className="pl-4 space-y-2">
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="mb-2 w-full px-2 py-1 border rounded bg-[#19273A] text-[#C9A14A] placeholder-[#C9A14A]"
                    />
                    <Link
                      href="/categories"
                      className="block px-4 py-2 text-sm font-medium text-[#C9A14A] bg-[#2a3b52] rounded-md mb-2"
                      onClick={() => {
                        setIsCategoryDropdownOpen(false);
                        setIsMenuOpen(false);
                      }}
                    >
                      View All Categories
                    </Link>
                    {filteredCategories.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/categories/${category.slug}`}
                        className="block px-4 py-2 text-sm text-[#C9A14A] hover:bg-[#2a3b52] rounded-md"
                        onClick={() => {
                          setIsCategoryDropdownOpen(false);
                          setIsMenuOpen(false);
                        }}
                      >
                        <span className="mr-2">{category.icon}</span>
                        {category.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/about"
                className={cn(
                  "text-[#C9A14A] hover:text-white transition-colors flex items-center",
                  isActive('/about') ? 'font-bold' : ''
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="mr-2">ℹ️</span>
                About
              </Link>

              <Link
                href="/contact"
                className={cn(
                  "text-[#C9A14A] hover:text-white transition-colors flex items-center",
                  isActive('/contact') ? 'font-bold' : ''
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="mr-2">✉️</span>
                Contact
              </Link>

              <Link
                href="/offers"
                className={cn(
                  "text-[#C9A14A] hover:text-white transition-colors flex items-center",
                  isActive('/offers') ? 'font-bold' : ''
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="mr-2">🏷️</span>
                Offers
              </Link>

              {/* Search in mobile menu */}
              <button
                type="button"
                className="text-[#C9A14A] hover:text-white transition-colors flex items-center"
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  setIsMenuOpen(false);
                }}
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-[#19273A]/95 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#2A3F5F] rounded-lg shadow-2xl w-full max-w-2xl p-6 relative">
            <button
              type="button"
              className="absolute top-4 right-4 text-[#C9A14A] hover:text-white"
              onClick={() => setIsSearchOpen(false)}
              aria-label="Close search"
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">Search Global Travel Report</h2>

            <form
              action="/search"
              method="GET"
              className="relative"
              onSubmit={() => setIsSearchOpen(false)}
            >
              <input
                type="text"
                name="q"
                placeholder="Search for stories, destinations, or travel tips..."
                className="w-full px-4 py-3 pl-12 bg-[#19273A] text-white border border-[#C9A14A]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C9A14A] placeholder-gray-400"
                // Removed autoFocus prop to improve accessibility
              />
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />

              <button
                type="submit"
                className="mt-4 w-full bg-[#C9A14A] hover:bg-[#C9A14A]/80 text-[#19273A] font-medium py-2 px-4 rounded-md transition-colors"
              >
                Search
              </button>
            </form>

            <div className="mt-8 border-t border-[#C9A14A]/20 pt-6">
              <h3 className="text-lg font-medium text-white mb-4">Popular Searches</h3>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/search?q=luxury+hotels"
                  className="px-3 py-1.5 bg-[#19273A] text-[#C9A14A] rounded-full hover:bg-[#C9A14A]/10 transition-colors"
                  onClick={() => setIsSearchOpen(false)}
                >
                  Luxury Hotels
                </Link>
                <Link
                  href="/search?q=travel+tips"
                  className="px-3 py-1.5 bg-[#19273A] text-[#C9A14A] rounded-full hover:bg-[#C9A14A]/10 transition-colors"
                  onClick={() => setIsSearchOpen(false)}
                >
                  Travel Tips
                </Link>
                <Link
                  href="/search?q=cruise+deals"
                  className="px-3 py-1.5 bg-[#19273A] text-[#C9A14A] rounded-full hover:bg-[#C9A14A]/10 transition-colors"
                  onClick={() => setIsSearchOpen(false)}
                >
                  Cruise Deals
                </Link>
                <Link
                  href="/search?q=flight+discounts"
                  className="px-3 py-1.5 bg-[#19273A] text-[#C9A14A] rounded-full hover:bg-[#C9A14A]/10 transition-colors"
                  onClick={() => setIsSearchOpen(false)}
                >
                  Flight Discounts
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};