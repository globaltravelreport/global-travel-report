"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X, Search } from 'lucide-react';
import Image from 'next/image';
import { FaFacebook, FaXTwitter, FaLinkedin, FaYoutube, FaTiktok, FaTumblr } from "react-icons/fa6";
import { EnhancedSearchBar } from '@/src/components/search/EnhancedSearchBar';
import { Story } from '@/types/Story';

const countries = [
  'Australia', 'Japan', 'United States', 'United Kingdom', 'France',
  'Italy', 'Spain', 'Germany', 'Canada', 'New Zealand', 'Thailand',
  'Vietnam', 'Singapore', 'Malaysia', 'Indonesia', 'China', 'India',
  'South Africa', 'Brazil', 'Mexico', 'Maldives', 'Africa', 'Europe', 'Asia', 'Global'
].sort();

const categories = [
  'Hotels', 'Airlines', 'Cruises', 'Destinations', 'Food & Dining',
  'Adventure', 'Culture', 'Shopping', 'Nightlife', 'Family Travel',
  'Luxury Travel', 'Budget Travel', 'Solo Travel', 'Honeymoon',
  'Business Travel', 'Eco Tourism', 'Wellness & Spa', 'Tours', 'Finance', 'Travel Tips'
].sort();

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [stories, setStories] = useState<Story[]>([]);
  const pathname = usePathname();

  // Fetch stories for search suggestions
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await fetch('/api/stories');
        if (response.ok) {
          const data = await response.json();
          setStories(data.stories || []);
        }
      } catch (error) {
        console.error('Error fetching stories for search:', error);
      }
    };

    fetchStories();
  }, []);

  const filteredCountries = countries.filter(country =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const filteredCategories = categories.filter(category =>
    category.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#19273A] shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo-gtr.png"
              alt="Global Travel Report Logo"
              width={56}
              height={56}
              className="rounded-none"
              priority
            />
            <span className="text-2xl font-extrabold text-[#C9A14A] tracking-wide">GLOBAL TRAVEL REPORT</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`text-[#C9A14A] hover:text-white transition-colors ${isActive('/') ? 'font-bold underline' : ''}`}
            >
              Home
            </Link>

            {/* Country Dropdown */}
            <div className="relative">
              <button
                className="flex items-center gap-1 text-[#C9A14A] hover:text-white transition-colors"
                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                type="button"
              >
                Countries
                <ChevronDown className="w-4 h-4" />
              </button>
              {isCountryDropdownOpen && (
                <div className="absolute top-full left-0 w-64 bg-[#19273A] shadow-lg rounded-md mt-2 p-2 z-50">
                  <input
                    type="text"
                    placeholder="Search countries..."
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    className="mb-2 w-full px-2 py-1 border border-[#C9A14A] rounded bg-[#19273A] text-[#C9A14A] placeholder-[#C9A14A]"
                  />
                  <div className="max-h-60 overflow-y-auto">
                    {filteredCountries.map((country) => (
                      <Link
                        key={country}
                        href={`/countries/${country.toLowerCase().replace(/\s+/g, '-')}`}
                        className="block px-4 py-2 text-sm text-[#C9A14A] hover:text-white hover:bg-[#1a2b3f] rounded-md"
                        onClick={() => setIsCountryDropdownOpen(false)}
                      >
                        {country}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="relative">
              <button
                className="flex items-center gap-1 text-[#C9A14A] hover:text-white transition-colors"
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                type="button"
              >
                Categories
                <ChevronDown className="w-4 h-4" />
              </button>
              {isCategoryDropdownOpen && (
                <div className="absolute top-full left-0 w-64 bg-[#19273A] shadow-lg rounded-md mt-2 p-2 z-50">
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="mb-2 w-full px-2 py-1 border border-[#C9A14A] rounded bg-[#19273A] text-[#C9A14A] placeholder-[#C9A14A]"
                  />
                  <div className="max-h-60 overflow-y-auto">
                    {filteredCategories.map((category) => (
                      <Link
                        key={category}
                        href={`/categories/${category.toLowerCase().replace(/\s+/g, '-')}`}
                        className="block px-4 py-2 text-sm text-[#C9A14A] hover:text-white hover:bg-[#1a2b3f] rounded-md"
                        onClick={() => setIsCategoryDropdownOpen(false)}
                      >
                        {category}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/about"
              className={`text-[#C9A14A] hover:text-white transition-colors ${isActive('/about') ? 'font-bold underline' : ''}`}
            >
              About
            </Link>

            <Link
              href="/contact"
              className={`text-[#C9A14A] hover:text-white transition-colors ${isActive('/contact') ? 'font-bold underline' : ''}`}
            >
              Contact
            </Link>

            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-[#C9A14A] hover:text-white transition-colors p-2 rounded-full hover:bg-[#1a2b3f]"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Social Media Icons */}
            <div className="flex items-center space-x-3">
              <a
                href="https://www.facebook.com/globaltravelreport"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-[#C9A14A] hover:text-white transition-colors"
              >
                <FaFacebook className="w-5 h-5" />
              </a>
              <a
                href="https://x.com/GTravelReport"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="text-[#C9A14A] hover:text-white transition-colors"
              >
                <FaXTwitter className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/globaltravelreport/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-[#C9A14A] hover:text-white transition-colors"
              >
                <FaLinkedin className="w-5 h-5" />
              </a>
              <a
                href="https://www.youtube.com/@GlobalTravelReport"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-[#C9A14A] hover:text-white transition-colors"
              >
                <FaYoutube className="w-5 h-5" />
              </a>
              <a
                href="https://www.tiktok.com/@globaltravelreport"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="text-[#C9A14A] hover:text-white transition-colors"
              >
                <FaTiktok className="w-5 h-5" />
              </a>
              <a
                href="https://www.tumblr.com/blog/globaltravelreport"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Tumblr"
                className="text-[#C9A14A] hover:text-white transition-colors"
              >
                <FaTumblr className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[#C9A14A]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            type="button"
            aria-label="Toggle menu"
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
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className={`text-[#C9A14A] hover:text-white transition-colors ${isActive('/') ? 'font-bold underline' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>

              <div className="space-y-2">
                <button
                  className="w-full flex items-center justify-between text-[#C9A14A] hover:text-white transition-colors"
                  onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                  type="button"
                >
                  Countries
                  <ChevronDown className="w-4 h-4" />
                </button>
                {isCountryDropdownOpen && (
                  <div className="pl-4 space-y-2">
                    <input
                      type="text"
                      placeholder="Search countries..."
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      className="mb-2 w-full px-2 py-1 border border-[#C9A14A] rounded bg-[#19273A] text-[#C9A14A] placeholder-[#C9A14A]"
                    />
                    {filteredCountries.map((country) => (
                      <Link
                        key={country}
                        href={`/countries/${country.toLowerCase().replace(/\s+/g, '-')}`}
                        className="block px-4 py-2 text-sm text-[#C9A14A] hover:text-white hover:bg-[#1a2b3f] rounded-md"
                        onClick={() => {
                          setIsCountryDropdownOpen(false);
                          setIsMenuOpen(false);
                        }}
                      >
                        {country}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <button
                  className="w-full flex items-center justify-between text-[#C9A14A] hover:text-white transition-colors"
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  type="button"
                >
                  Categories
                  <ChevronDown className="w-4 h-4" />
                </button>
                {isCategoryDropdownOpen && (
                  <div className="pl-4 space-y-2">
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="mb-2 w-full px-2 py-1 border border-[#C9A14A] rounded bg-[#19273A] text-[#C9A14A] placeholder-[#C9A14A]"
                    />
                    {filteredCategories.map((category) => (
                      <Link
                        key={category}
                        href={`/categories/${category.toLowerCase().replace(/\s+/g, '-')}`}
                        className="block px-4 py-2 text-sm text-[#C9A14A] hover:text-white hover:bg-[#1a2b3f] rounded-md"
                        onClick={() => {
                          setIsCategoryDropdownOpen(false);
                          setIsMenuOpen(false);
                        }}
                      >
                        {category}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/about"
                className={`text-[#C9A14A] hover:text-white transition-colors ${isActive('/about') ? 'font-bold underline' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>

              <Link
                href="/contact"
                className={`text-[#C9A14A] hover:text-white transition-colors ${isActive('/contact') ? 'font-bold underline' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>

              {/* Search Button - Mobile */}
              <button
                className="flex items-center text-[#C9A14A] hover:text-white transition-colors"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsSearchOpen(true);
                }}
              >
                <Search className="w-5 h-5 mr-2" />
                Search
              </button>

              {/* Social Media Icons - Mobile */}
              <div className="flex items-center space-x-4 pt-4">
                <a
                  href="https://www.facebook.com/globaltravelreport"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="text-[#C9A14A] hover:text-white transition-colors"
                >
                  <FaFacebook className="w-5 h-5" />
                </a>
                <a
                  href="https://x.com/GTravelReport"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter)"
                  className="text-[#C9A14A] hover:text-white transition-colors"
                >
                  <FaXTwitter className="w-5 h-5" />
                </a>
                <a
                  href="https://www.linkedin.com/company/globaltravelreport/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="text-[#C9A14A] hover:text-white transition-colors"
                >
                  <FaLinkedin className="w-5 h-5" />
                </a>
                <a
                  href="https://www.youtube.com/@GlobalTravelReport"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="text-[#C9A14A] hover:text-white transition-colors"
                >
                  <FaYoutube className="w-5 h-5" />
                </a>
                <a
                  href="https://www.tiktok.com/@globaltravelreport"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="text-[#C9A14A] hover:text-white transition-colors"
                >
                  <FaTiktok className="w-5 h-5" />
                </a>
                <a
                  href="https://www.tumblr.com/blog/globaltravelreport"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Tumblr"
                  className="text-[#C9A14A] hover:text-white transition-colors"
                >
                  <FaTumblr className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20 px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Search Global Travel Report</h2>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close search"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <EnhancedSearchBar
                stories={stories}
                placeholder="Search for destinations, travel tips, and more..."
                onSearch={(query) => {
                  window.location.href = `/search?q=${encodeURIComponent(query)}`;
                  setIsSearchOpen(false);
                }}
              />

              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Popular Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 8).map((category) => (
                    <Link
                      key={category}
                      href={`/categories/${category.toLowerCase().replace(/\s+/g, '-')}`}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700"
                      onClick={() => setIsSearchOpen(false)}
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}