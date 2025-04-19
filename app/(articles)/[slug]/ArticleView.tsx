'use client'

import { featuredItems } from '@/data/featured'
import { FeaturedItem } from '@/types'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'

interface ArticleViewProps {
  slug: string
}

export default function ArticleView({ slug }: ArticleViewProps) {
  const article = featuredItems.find(item => item.slug === slug)

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
        <p>The requested article could not be found.</p>
        <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
          Return to Home
        </Link>
      </div>
    )
  }

  const formattedDate = format(new Date(article.date), 'MMMM d, yyyy')

  return (
    <article className="container mx-auto px-4 py-8">
      <Link href="/" className="text-blue-600 hover:underline mb-8 inline-block">
        ← Back to Articles
      </Link>
      
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
        <div className="flex items-center text-gray-600 mb-4">
          <span className="mr-4">{article.category}</span>
          <span>{formattedDate}</span>
        </div>
      </header>

      <div className="relative w-full h-[400px] mb-8">
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover rounded-lg"
          priority
        />
      </div>

      <div className="prose max-w-none mb-8">
        <p className="text-xl text-gray-700 mb-6">{article.summary}</p>
        {/* Full article content would go here */}
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          aria-label="Share on Twitter"
        >
          Share on Twitter
        </button>
        <button
          onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          aria-label="Share on Facebook"
        >
          Share on Facebook
        </button>
        <button
          onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(article.title)}`, '_blank')}
          className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
          aria-label="Share on LinkedIn"
        >
          Share on LinkedIn
        </button>
      </div>
    </article>
  )
} 