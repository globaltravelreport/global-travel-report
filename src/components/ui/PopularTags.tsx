'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Tag {
  name: string;
  count: number;
  slug: string;
}

interface PopularTagsProps {
  maxTags?: number;
  className?: string;
  variant?: 'default' | 'compact' | 'cloud';
  showCounts?: boolean;
}

export default function PopularTags({
  maxTags = 10,
  className = '',
  variant = 'default',
  showCounts = false
}: PopularTagsProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPopularTags = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/tags/popular?limit=${maxTags}`);
        if (response.ok) {
          const data = await response.json();
          setTags(data);
        }
      } catch (_error) {
        console.error('Error fetching popular tags:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularTags();
  }, [maxTags]);

  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900">Popular Tags</h3>
        <div className="flex flex-wrap gap-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tags.length === 0) {
    return null;
  }

  const getTagSize = (count: number, maxCount: number) => {
    const minSize = variant === 'cloud' ? 0.8 : 1;
    const maxSize = variant === 'cloud' ? 1.5 : 1;
    const normalizedCount = count / maxCount;
    return minSize + (normalizedCount * (maxSize - minSize));
  };

  const maxCount = Math.max(...tags.map(tag => tag.count));

  if (variant === 'cloud') {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900">Popular Topics</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {tags.map((tag, index) => {
            const size = getTagSize(tag.count, maxCount);
            return (
              <motion.div
                key={tag.slug}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={`/tags/${tag.slug}`}
                  className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-2 rounded-full text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  style={{
                    fontSize: `${size}rem`,
                    transform: `rotate(${Math.random() * 6 - 3}deg)`
                  }}
                >
                  {tag.name}
                  {showCounts && (
                    <span className="ml-1 opacity-75">({tag.count})</span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`space-y-2 ${className}`}>
        <h4 className="text-sm font-semibold text-gray-900">Popular Tags</h4>
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 6).map((tag) => (
            <Link
              key={tag.slug}
              href={`/tags/${tag.slug}`}
              className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs transition-colors duration-200"
            >
              {tag.name}
              {showCounts && (
                <span className="ml-1 text-gray-500">({tag.count})</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900">Popular Tags</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {tags.map((tag, index) => (
          <motion.div
            key={tag.slug}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              href={`/tags/${tag.slug}`}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
            >
              <span className="font-medium text-gray-900 group-hover:text-blue-600">
                {tag.name}
              </span>
              {showCounts && (
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {tag.count}
                </span>
              )}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Hook for fetching tags data
export function usePopularTags(limit = 10) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/tags/popular?limit=${limit}`);
        if (response.ok) {
          const data = await response.json();
          setTags(data);
        } else {
          throw new Error('Failed to fetch tags');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, [limit]);

  return { tags, isLoading, error };
}