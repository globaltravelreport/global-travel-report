'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar({ className = '' }: { className?: string }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const _router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // In a real implementation, this would navigate to a search results page
      // For now, we'll just alert the search query
      alert(`Search for: ${searchQuery}`);
      // router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="flex items-center">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 text-white hover:text-brand-gold transition-colors duration-200"
          aria-label="Toggle search"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isExpanded ? 'w-48 md:w-64 opacity-100' : 'w-0 opacity-0'
          }`}
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full bg-transparent border-b border-white/30 focus:border-brand-gold px-2 py-1 text-white placeholder-gray-400 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className={`ml-1 text-white hover:text-brand-gold transition-colors duration-200 ${
            isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
          }`}
          aria-label="Submit search"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}
