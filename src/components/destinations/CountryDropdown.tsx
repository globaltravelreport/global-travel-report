'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Globe, MapPin } from 'lucide-react';
import { isValidCountry } from '@/src/utils/countries';

interface CountryDropdownProps {
  countries: string[];
}

export function CountryDropdown({ countries }: CountryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter to only show valid countries in the dropdown
  // Make sure we're working with actual country names, not headers
  const validCountries = countries
    .filter(country => isValidCountry(country) && country.trim() !== '')
    .sort((a, b) => a.localeCompare(b));

  // Filter out any non-country entries that might be headers or invalid data
  const otherEntries = countries
    .filter(country => !isValidCountry(country) && country.trim() !== '' && !country.includes('header'))
    .sort((a, b) => a.localeCompare(b));

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
        <span className="flex items-center gap-2">
          {selectedCountry ? (
            <>
              {isValidCountry(selectedCountry) ? (
                <MapPin size={18} className="text-blue-600" />
              ) : (
                <Globe size={18} className="text-gray-500" />
              )}
              <span className="block truncate">{selectedCountry}</span>
            </>
          ) : (
            <span className="block truncate">Choose a country</span>
          )}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          <div className="sticky top-0 bg-gray-100 px-4 py-2 font-semibold text-sm text-gray-700 border-b">
            Countries
          </div>
          <ul className="py-1" role="listbox">
            {validCountries.map((country) => (
              <li
                key={country}
                onClick={() => handleCountrySelect(country)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleCountrySelect(country);
                  }
                }}
                className="px-4 py-2 cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2"
                role="option"
                aria-selected={selectedCountry === country}
                tabIndex={0}
              >
                <MapPin size={16} className="text-blue-600 flex-shrink-0" />
                <span>{country}</span>
              </li>
            ))}
          </ul>

          {otherEntries.length > 0 && (
            <>
              <div className="sticky top-0 bg-gray-100 px-4 py-2 font-semibold text-sm text-gray-700 border-b border-t">
                Regions & Other
              </div>
              <ul className="py-1" role="listbox">
                {otherEntries.map((entry) => (
                  <li
                    key={entry}
                    onClick={() => handleCountrySelect(entry)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleCountrySelect(entry);
                      }
                    }}
                    className="px-4 py-2 cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2"
                    role="option"
                    aria-selected={selectedCountry === entry}
                    tabIndex={0}
                  >
                    <Globe size={16} className="text-gray-500 flex-shrink-0" />
                    <span>{entry}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
