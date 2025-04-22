import Link from 'next/link'
import Image from 'next/image'
import { Story } from '../lib/stories'

interface StoryCardProps {
  story: Story
}

export default function StoryCard({ story }: StoryCardProps) {
  return (
    <article className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/stories/${story.slug}`} className="block">
        {story.imageName && (
          <div className="relative h-48 w-full">
            <Image
              src={`/images/${story.imageName}`}
              alt={story.title}
              fill
              className="object-cover"
            />
            {story.isSponsored && (
              <span className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                Sponsored
              </span>
            )}
          </div>
        )}
        
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {story.country}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {story.category}
            </span>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600">
            {story.title}
          </h2>
          
          <p className="text-gray-600 mb-4 line-clamp-3">
            {story.metaDescription}
          </p>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <span>{story.author}</span>
              <span className="mx-2">•</span>
              <span>{story.readTime} min read</span>
            </div>
            <time>
              {new Date(story.timestamp).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          </div>
          
          {story.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {story.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </article>
  )
} 