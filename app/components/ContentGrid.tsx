'use client';

import Image from 'next/image'
import Link from 'next/link'
import { FeaturedItem } from '@/types'

interface ContentGridProps {
  items?: FeaturedItem[]
}

export default function ContentGrid({ items = [] }: ContentGridProps) {
  if (!items || items.length === 0) {
    return (
      <div 
        className="text-center py-12"
        role="status"
        aria-live="polite"
      >
        <p className="text-gray-500">No featured articles available at the moment.</p>
      </div>
    )
  }

  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 sm:p-6"
      role="list"
      aria-label="Featured articles"
    >
      {items.map((item) => {
        const articleUrl = `https://www.globaltravelreport.com/articles/${item.slug}`;
        const articleSchema = {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: item.title,
          description: item.summary,
          image: item.image,
          datePublished: item.date,
          dateModified: item.date,
          author: {
            '@type': 'Organization',
            name: 'Global Travel Report'
          },
          publisher: {
            '@type': 'Organization',
            name: 'Global Travel Report',
            logo: {
              '@type': 'ImageObject',
              url: 'https://www.globaltravelreport.com/images/logo.png'
            }
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': articleUrl
          }
        };

        return (
          <article 
            key={item.id}
            className="group hover:shadow-xl transition-all duration-300 rounded-lg overflow-hidden bg-white transform hover:-translate-y-1 focus-within:ring-2 focus-within:ring-brand-teal focus-within:ring-offset-2"
            role="listitem"
            itemScope
            itemType="https://schema.org/Article"
          >
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />
            <Link 
              href={`/articles/${item.slug}`}
              className="block focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2"
              aria-label={`Read more about ${item.title}`}
              itemProp="url"
            >
              <div className="relative h-48 sm:h-56">
                <Image
                  src={item.image}
                  alt={`Featured image for ${item.title}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  loading="lazy"
                  quality={75}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/placeholder.jpg';
                    target.alt = 'Image not available';
                  }}
                  itemProp="image"
                />
                {item.photographer && (
                  <div className="absolute bottom-0 right-0 bg-black/80 text-white text-xs px-3 py-2 rounded-tl-lg backdrop-blur-sm">
                    <span className="block font-medium">Photo by{' '}
                      <a
                        href={item.photographer.url}
                        className="underline hover:text-brand-teal transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`View ${item.photographer.name}'s profile on Unsplash`}
                      >
                        {item.photographer.name}
                      </a>
                    </span>
                    <span className="text-gray-300">
                      on{' '}
                      <a
                        href="https://unsplash.com"
                        className="underline hover:text-brand-teal transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Unsplash
                      </a>
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <span 
                    className="px-2 py-1 bg-brand-teal text-white text-xs font-medium rounded-full"
                    aria-label={`Category: ${item.category}`}
                    itemProp="articleSection"
                  >
                    {item.category}
                  </span>
                  <time 
                    dateTime={item.date}
                    className="text-gray-500 text-sm"
                    itemProp="datePublished"
                  >
                    {new Date(item.date).toLocaleDateString('en-AU', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </time>
                </div>
                <h3 
                  className="text-lg sm:text-xl font-semibold leading-tight mb-2 group-hover:text-brand-teal transition-colors"
                  itemProp="headline"
                >
                  {item.title}
                </h3>
                <p 
                  className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4 line-clamp-2"
                  itemProp="description"
                >
                  {item.summary}
                </p>
                <div className="mt-4 flex items-center text-brand-teal group-hover:text-teal-700 transition-colors">
                  <span className="text-sm font-medium">Read More</span>
                  <svg 
                    className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 5l7 7-7 7" 
                    />
                  </svg>
                </div>
              </div>
            </Link>
          </article>
        );
      })}
    </div>
  );
} 