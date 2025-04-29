'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const countries = [
  'France',
  'Italy',
  'Spain',
  'United States',
  'Japan',
  'Thailand',
  'Australia',
  'Brazil',
  'Canada',
  'Mexico',
].sort();

const categories = [
  'Hotels',
  'Airlines',
  'Tours',
  'Restaurants',
  'Activities',
  'Shopping',
  'Transportation',
  'Tips',
].sort();

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCountriesOpen, setIsCountriesOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState(countries);
  const [filteredCategories, setFilteredCategories] = useState(categories);

  const handleCountrySearch = (query: string) => {
    setFilteredCountries(
      countries.filter((country) =>
        country.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const handleCategorySearch = (query: string) => {
    setFilteredCategories(
      categories.filter((category) =>
        category.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            Global Travel Report
          </Link>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-primary">
              Home
            </Link>

            {/* Countries dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                className="flex items-center space-x-1"
                onClick={() => {
                  setIsCountriesOpen(!isCountriesOpen);
                  setIsCategoriesOpen(false);
                }}
              >
                <span>Countries</span>
                <ChevronDown className={`h-4 w-4 ${isCountriesOpen ? 'rotate-180' : ''}`} />
              </Button>

              {isCountriesOpen && (
                <div className="absolute top-full left-0 w-64 bg-white shadow-lg rounded-md py-2 z-50">
                  <Input
                    type="search"
                    placeholder="Search countries..."
                    className="mx-2 mb-2 w-[calc(100%-1rem)]"
                    onChange={(e) => handleCountrySearch(e.target.value)}
                  />
                  <div className="max-h-64 overflow-y-auto">
                    {filteredCountries.map((country) => (
                      <Link
                        key={country}
                        href={`/countries/${country.toLowerCase()}`}
                        className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
                        onClick={() => setIsCountriesOpen(false)}
                      >
                        {country}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Categories dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                className="flex items-center space-x-1"
                onClick={() => {
                  setIsCategoriesOpen(!isCategoriesOpen);
                  setIsCountriesOpen(false);
                }}
              >
                <span>Categories</span>
                <ChevronDown className={`h-4 w-4 ${isCategoriesOpen ? 'rotate-180' : ''}`} />
              </Button>

              {isCategoriesOpen && (
                <div className="absolute top-full left-0 w-64 bg-white shadow-lg rounded-md py-2 z-50">
                  <Input
                    type="search"
                    placeholder="Search categories..."
                    className="mx-2 mb-2 w-[calc(100%-1rem)]"
                    onChange={(e) => handleCategorySearch(e.target.value)}
                  />
                  <div className="max-h-64 overflow-y-auto">
                    {filteredCategories.map((category) => (
                      <Link
                        key={category}
                        href={`/categories/${category.toLowerCase()}`}
                        className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
                        onClick={() => setIsCategoriesOpen(false)}
                      >
                        {category}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link href="/about" className="text-gray-600 hover:text-primary">
              About
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-primary">
              Contact
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-4">
            <Link
              href="/"
              className="block text-gray-600 hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <div>
              <Button
                variant="ghost"
                className="flex items-center space-x-1"
                onClick={() => setIsCountriesOpen(!isCountriesOpen)}
              >
                <span>Countries</span>
                <ChevronDown className={`h-4 w-4 ${isCountriesOpen ? 'rotate-180' : ''}`} />
              </Button>
              {isCountriesOpen && (
                <div className="pl-4 mt-2 space-y-2">
                  <Input
                    type="search"
                    placeholder="Search countries..."
                    className="mb-2"
                    onChange={(e) => handleCountrySearch(e.target.value)}
                  />
                  {filteredCountries.map((country) => (
                    <Link
                      key={country}
                      href={`/countries/${country.toLowerCase()}`}
                      className="block text-gray-600 hover:text-primary"
                      onClick={() => {
                        setIsCountriesOpen(false);
                        setIsMenuOpen(false);
                      }}
                    >
                      {country}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Button
                variant="ghost"
                className="flex items-center space-x-1"
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              >
                <span>Categories</span>
                <ChevronDown className={`h-4 w-4 ${isCategoriesOpen ? 'rotate-180' : ''}`} />
              </Button>
              {isCategoriesOpen && (
                <div className="pl-4 mt-2 space-y-2">
                  <Input
                    type="search"
                    placeholder="Search categories..."
                    className="mb-2"
                    onChange={(e) => handleCategorySearch(e.target.value)}
                  />
                  {filteredCategories.map((category) => (
                    <Link
                      key={category}
                      href={`/categories/${category.toLowerCase()}`}
                      className="block text-gray-600 hover:text-primary"
                      onClick={() => {
                        setIsCategoriesOpen(false);
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
              className="block text-gray-600 hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block text-gray-600 hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
} 