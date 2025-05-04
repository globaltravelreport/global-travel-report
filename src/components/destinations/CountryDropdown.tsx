'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface CountryDropdownProps {
  countries: string[];
}

export function CountryDropdown({ countries }: CountryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
    setIsOpen(false);
    
    // Scroll to the country section
    const countryElement = document.getElementById(`country-${country.toLowerCase().replace(/\s+/g, '-')}`);
    if (countryElement) {
      countryElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto mb-8" ref={dropdownRef}>
      <div className="text-center mb-2 font-medium text-gray-700">
        Select a destination country:
      </div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="block truncate">
          {selectedCountry || 'Choose a country'}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          <ul className="py-1" role="listbox">
            {countries.map((country) => (
              <li
                key={country}
                onClick={() => handleCountrySelect(country)}
                className="px-4 py-2 cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors"
                role="option"
                aria-selected={selectedCountry === country}
              >
                {country}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
