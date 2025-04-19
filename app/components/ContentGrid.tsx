import Image from 'next/image'
import Link from 'next/link'
import { FeaturedItem } from '../types/content'

interface ContentGridProps {
  items?: FeaturedItem[]
}

export default function ContentGrid({ items = [] }: ContentGridProps) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No featured articles available at the moment.</p>
      </div>
    )
  }

  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6"
      role="list"
      aria-label="Featured articles"
    >
      {items.map((item) => (
        <article 
          key={item.id}
          className="group hover:shadow-xl transition-all duration-300 rounded-lg overflow-hidden bg-white transform hover:-translate-y-1 focus-within:ring-2 focus-within:ring-brand-teal focus-within:ring-offset-2"
          role="listitem"
        >
          <Link 
            href={`/articles/${item.slug}`}
            className="block focus:outline-none"
            aria-label={`Read more about ${item.title}`}
          >
            <div className="relative h-48">
              <Image
                src={item.image}
                alt={`Featured image for ${item.title}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading="lazy"
                quality={75}
              />
              {item.photographer && (
                <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-3 py-1.5 rounded-tl">
                  Photo by{' '}
                  <a
                    href={item.photographer.url}
                    className="underline hover:text-gray-200"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View ${item.photographer.name}'s profile on Unsplash`}
                  >
                    {item.photographer.name}
                  </a>
                  {' '}on{' '}
                  <a
                    href="https://unsplash.com"
                    className="underline hover:text-gray-200"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Unsplash
                  </a>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span 
                  className="px-2 py-1 bg-brand-teal text-white text-xs font-medium rounded-full"
                  aria-label={`Category: ${item.category}`}
                >
                  {item.category}
                </span>
                <time 
                  dateTime={item.date}
                  className="text-gray-500 text-sm"
                >
                  {new Date(item.date).toLocaleDateString('en-AU', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </time>
              </div>
              <h3 className="text-xl font-semibold group-hover:text-brand-teal transition-colors">
                {item.title}
              </h3>
              <p className="mt-2 text-gray-600 line-clamp-2">
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
      ))}
    </div>
  )
} 