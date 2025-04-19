'use client';

import Image from 'next/image';
import Link from 'next/link';
import { StoryDraft } from '@/types/content';

interface LatestNewsProps {
  stories: StoryDraft[];
}

export default function LatestNews({ stories }: LatestNewsProps) {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Latest News</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <article key={story.publishedAt} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative h-48">
                {story.featuredImage.url ? (
                  <Image
                    src={story.featuredImage.url}
                    alt={story.featuredImage.alt}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <span className="px-3 py-1 bg-brand-teal text-white text-sm font-medium rounded-full">
                    {story.category.charAt(0).toUpperCase() + story.category.slice(1)}
                  </span>
                  <span className="text-gray-500">
                    {new Date(story.publishedAt || '').toLocaleDateString('en-AU', {
                      day: 'numeric',
                      month: 'long'
                    })}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{story.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{story.summary}</p>
                <Link
                  href={`/stories/${encodeURIComponent(story.title.toLowerCase().replace(/\s+/g, '-'))}`}
                  className="inline-flex items-center text-brand-teal hover:text-teal-700"
                >
                  Read More
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
} 