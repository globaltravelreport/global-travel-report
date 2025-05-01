'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllStories } from '@/src/utils/stories';
import { Story } from '@/types/Story';

export default function Hero() {
  const [featuredStory, setFeaturedStory] = useState<Story | null>(null);

  useEffect(() => {
    const loadFeaturedStory = async () => {
      const stories = await getAllStories();
      const featured = stories.find(story => story.featured);
      setFeaturedStory(featured || stories[0]);
    };

    loadFeaturedStory();
  }, []);

  if (!featuredStory) {
    return (
      <div className="relative h-[600px] bg-gray-100 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-2xl text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[600px]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={featuredStory.imageUrl || '/images/hero-placeholder.jpg'}
          alt={featuredStory.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        {featuredStory.photographer && (
          <div className="absolute bottom-2 right-2 text-white text-xs bg-black/50 px-2 py-1 rounded">
            Photo by{" "}
            <a
              href={featuredStory.photographer.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-200"
            >
              {featuredStory.photographer.name}
            </a>
            {" "}on{" "}
            <a
              href="https://unsplash.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-200"
            >
              Unsplash
            </a>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-center h-full">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {featuredStory.title}
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              {featuredStory.excerpt}
            </p>
            <div className="flex space-x-4">
              <Link
                href={`/stories/${featuredStory.slug}`}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Read More
              </Link>
              <Link
                href="/submit"
                className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-gray-900"
              >
                Share Your Story
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}