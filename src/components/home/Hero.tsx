'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllStories } from '../../utils/stories';
import { Story } from '../../../types/Story';

export default function Hero() {
  const [featuredStory, setFeaturedStory] = useState<Story | null>(null);

  useEffect(() => {
    const loadFeaturedStory = async () => {
      try {
        console.log('Hero: Loading stories...');
        const stories = await getAllStories();
        console.log('Hero: Loaded stories:', stories.length, stories.map(s => ({ id: s.id, title: s.title, featured: s.featured })));

        // Filter for recent stories (last 30 days) for homepage
        const recentStories = stories.filter(story => {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const storyDate = new Date(story.publishedAt || '');
          return storyDate >= thirtyDaysAgo;
        });

        console.log('Hero: Recent stories count:', recentStories.length);

        // First try to find a featured story from recent stories
        const featured = recentStories.find(story => story.featured);
        const storyToUse = featured || (recentStories.length > 0 ? recentStories[0] : null);

        console.log('Hero: Selected story:', storyToUse?.title || 'None');
        setFeaturedStory(storyToUse);
      } catch (_error) {
        console.error('Error loading featured story:', error);
        // Set a fallback story or handle the error state
        setFeaturedStory(null);
      }
    };

    loadFeaturedStory();
  }, []);

  if (!featuredStory) {
    return (
      <div className="relative h-[600px] bg-gradient-to-b from-gray-100 to-gray-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-600 mb-4">
              Global Travel Report
            </h1>
            <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto">
              Your destination for inspiring travel stories, tips, and guides from around the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <a
                href="/destinations"
                className="bg-gradient-to-r from-[#C9A14A] to-[#B08D3F] hover:from-[#D5B05C] hover:to-[#C9A14A] text-white font-bold py-4 px-10 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#C9A14A] focus:ring-offset-2 shadow-lg hover:shadow-xl"
              >
                Explore Destinations
              </a>
              <a
                href="/categories"
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-gray-700 border border-gray-300 font-bold py-4 px-10 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 shadow-lg hover:shadow-xl"
              >
                Browse Categories
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[600px]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={featuredStory.imageUrl || '/images/hero-rewrite.jpg'}
          alt={featuredStory.title}
          fill
          className="object-cover"
          priority
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        {featuredStory.photographer && featuredStory.photographer.name && (
          <div className="absolute bottom-2 right-2 text-white text-xs bg-black/50 px-2 py-1 rounded">
            Photo by{" "}
            {featuredStory.photographer.url ? (
              <a
                href={featuredStory.photographer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-200"
              >
                {featuredStory.photographer.name}
              </a>
            ) : (
              <span>{featuredStory.photographer.name}</span>
            )}
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