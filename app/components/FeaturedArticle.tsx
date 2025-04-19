'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Category } from '@/types/content';

interface FeaturedArticleProps {
  title: string;
  summary: string;
  imageUrl: string;
  imageAlt: string;
  category: Category;
  author: string;
  publishedAt: string;
}

export default function FeaturedArticle({
  title,
  summary,
  imageUrl,
  imageAlt,
  category,
  author,
  publishedAt
}: FeaturedArticleProps) {
  const formattedDate = new Date(publishedAt).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Story</h2>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative h-96">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={imageAlt}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>
          <div className="p-8">
            <div className="flex items-center space-x-4 mb-4">
              <span className="px-3 py-1 bg-brand-teal text-white text-sm font-medium rounded-full">
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </span>
              <span className="text-gray-500">{formattedDate}</span>
              <span className="text-gray-500">By {author}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
            <p className="text-gray-600 mb-6">{summary}</p>
            <Link
              href={`/stories/${encodeURIComponent(title.toLowerCase().replace(/\s+/g, '-'))}`}
              className="inline-flex items-center text-brand-teal hover:text-teal-700"
            >
              Read More
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
} 