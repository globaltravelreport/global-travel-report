'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type { Story } from '@/types/Story';
import { Input } from './ui/input';

interface SearchBarProps {
  stories: Story[];
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  stories,
  onSearch,
  placeholder = 'Search...',
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Story[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const filteredStories = stories.filter((story) =>
      story.title.toLowerCase().includes(query.toLowerCase()) ||
      story.excerpt.toLowerCase().includes(query.toLowerCase()) ||
      story.category.toLowerCase().includes(query.toLowerCase())
    );

    setSuggestions(filteredStories.slice(0, 5));
  }, [query, stories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
    setIsOpen(false);
  };

  const handleSuggestionClick = (story: Story) => {
    router.push(`/stories/${story.slug}`);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <Input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      </form>

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
            id="search-suggestions"
            role="listbox"
          >
            {suggestions.map((story) => (
              <button
                key={story.id}
                onClick={() => handleSuggestionClick(story)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
                role="option"
                aria-selected="false"
              >
                <div className="font-medium text-gray-900 dark:text-white">{story.title}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{story.category}</div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};