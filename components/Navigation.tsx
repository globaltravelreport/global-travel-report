'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronDown, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const countries = [
  'Australia', 'Japan', 'United States', 'United Kingdom', 'France',
  'Italy', 'Spain', 'Germany', 'Canada', 'New Zealand', 'Thailand',
  'Vietnam', 'Singapore', 'Malaysia', 'Indonesia', 'China', 'India',
  'South Africa', 'Brazil', 'Mexico'
].sort();

const categories = [
  'Hotels', 'Airlines', 'Cruises', 'Destinations', 'Food & Dining',
  'Adventure', 'Culture', 'Shopping', 'Nightlife', 'Family Travel',
  'Luxury Travel', 'Budget Travel', 'Solo Travel', 'Honeymoon',
  'Business Travel', 'Eco Tourism', 'Wellness & Spa'
].sort();

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const pathname = usePathname();

  const filteredCountries = countries.filter(country =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const filteredCategories = categories.filter(category =>
    category.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-primary">Global Travel Report</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={cn(
                "text-gray-700 hover:text-primary transition-colors",
                isActive('/') && "text-primary font-medium"
              )}
            >
              Home
            </Link>

            {/* Country Dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                className="flex items-center gap-1"
                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
              >
                Countries
                <ChevronDown className="w-4 h-4" />
              </Button>

              {isCountryDropdownOpen && (
                <div className="absolute top-full left-0 w-64 bg-white shadow-lg rounded-md mt-2 p-2">
                  <Input
                    type="text"
                    placeholder="Search countries..."
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    className="mb-2"
                  />
                  <div className="max-h-60 overflow-y-auto">
                    {filteredCountries.map((country) => (
                      <Link
                        key={country}
                        href={`/countries/${country.toLowerCase()}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
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
              <Button
                variant="ghost"
                className="flex items-center gap-1"
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              >
                Categories
                <ChevronDown className="w-4 h-4" />
              </Button>

              {isCategoryDropdownOpen && (
                <div className="absolute top-full left-0 w-64 bg-white shadow-lg rounded-md mt-2 p-2">
                  <Input
                    type="text"
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="mb-2"
                  />
                  <div className="max-h-60 overflow-y-auto">
                    {filteredCategories.map((category) => (
                      <Link
                        key={category}
                        href={`/categories/${category.toLowerCase()}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
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
              className={cn(
                "text-gray-700 hover:text-primary transition-colors",
                isActive('/about') && "text-primary font-medium"
              )}
            >
              About
            </Link>

            <Link
              href="/contact"
              className={cn(
                "text-gray-700 hover:text-primary transition-colors",
                isActive('/contact') && "text-primary font-medium"
              )}
            >
              Contact
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
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
                className={cn(
                  "text-gray-700 hover:text-primary transition-colors",
                  isActive('/') && "text-primary font-medium"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>

              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-between"
                  onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                >
                  Countries
                  <ChevronDown className="w-4 h-4" />
                </Button>

                {isCountryDropdownOpen && (
                  <div className="pl-4 space-y-2">
                    <Input
                      type="text"
                      placeholder="Search countries..."
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      className="mb-2"
                    />
                    {filteredCountries.map((country) => (
                      <Link
                        key={country}
                        href={`/countries/${country.toLowerCase()}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
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
                <Button
                  variant="ghost"
                  className="w-full justify-between"
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                >
                  Categories
                  <ChevronDown className="w-4 h-4" />
                </Button>

                {isCategoryDropdownOpen && (
                  <div className="pl-4 space-y-2">
                    <Input
                      type="text"
                      placeholder="Search categories..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="mb-2"
                    />
                    {filteredCategories.map((category) => (
                      <Link
                        key={category}
                        href={`/categories/${category.toLowerCase()}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
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
                className={cn(
                  "text-gray-700 hover:text-primary transition-colors",
                  isActive('/about') && "text-primary font-medium"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>

              <Link
                href="/contact"
                className={cn(
                  "text-gray-700 hover:text-primary transition-colors",
                  isActive('/contact') && "text-primary font-medium"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}; 