'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Story } from '@/types/Story';

interface RelatedStoriesProps {
  currentStoryId: string;
  currentStoryTags?: string[];
  maxStories?: number;
  className?: string;
}

export default function RelatedStories({
  currentStoryId,
  currentStoryTags = [],
  maxStories = 3,
  className = ''
}: RelatedStoriesProps) {
  const [relatedStories, setRelatedStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedStories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/stories/related?exclude=${currentStoryId}&tags=${currentStoryTags.join(',')}&limit=${maxStories}`);
        if (response.ok) {
          const stories = await response.json();
          setRelatedStories(stories);
        } else {
          // Fallback: fetch recent stories
          const fallbackResponse = await fetch(`/api/stories?limit=${maxStories}&exclude=${currentStoryId}`);
          if (fallbackResponse.ok) {
            const stories = await fallbackResponse.json();
            setRelatedStories(stories);
          }
        }
      } catch (error) {
        console.error('Error fetching related stories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentStoryId) {
      fetchRelatedStories();
    }
  }, [currentStoryId, currentStoryTags, maxStories]);

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">You might also like</h3>
        {[...Array(maxStories)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-lg mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (relatedStories.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">You might also like</h3>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {relatedStories.map((story, index) => (
          <motion.article
            key={story.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group"
          >
            <Link href={`/stories/${story.slug}`} className="block">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={story.imageUrl || '/images/placeholder.jpg'}
                  alt={story.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {story.featured && (
                  <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                    Featured
                  </div>
                )}
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {story.title}
                </h4>
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {story.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{story.author}</span>
                  <span>{new Date(story.publishedAt).toLocaleDateString()}</span>
                </div>
                {story.tags && story.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {story.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

// Alternative compact version for sidebars
export function RelatedStoriesCompact({
  currentStoryId,
  currentStoryTags = [],
  maxStories = 4,
  className = ''
}: RelatedStoriesProps) {
  const [relatedStories, setRelatedStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedStories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/stories/related?exclude=${currentStoryId}&tags=${currentStoryTags.join(',')}&limit=${maxStories}`);
        if (response.ok) {
          const stories = await response.json();
          setRelatedStories(stories);
        }
      } catch (error) {
        console.error('Error fetching related stories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentStoryId) {
      fetchRelatedStories();
    }
  }, [currentStoryId, currentStoryTags, maxStories]);

  if (isLoading || relatedStories.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className="font-semibold text-gray-900 text-sm">Related Stories</h4>
      <div className="space-y-3">
        {relatedStories.map((story, index) => (
          <Link
            key={story.id}
            href={`/stories/${story.slug}`}
            className="block group"
          >
            <div className="flex gap-3">
              <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded">
                <Image
                  src={story.imageUrl || '/images/placeholder.jpg'}
                  alt={story.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  sizes="64px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {story.title}
                </h5>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(story.publishedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}