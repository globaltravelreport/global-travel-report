import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Story } from '../types'

export const metadata: Metadata = {
  title: 'Global Travel Report - Travel Stories & Guides',
  description: 'Discover curated travel stories, guides, and insights from around the world.',
  openGraph: {
    title: 'Global Travel Report - Travel Stories & Guides',
    description: 'Discover curated travel stories, guides, and insights from around the world.',
  },
}

async function getStories(): Promise<Story[]> {
  const stories = await import('../data/stories/top-airlines-business-class.json')
  return [stories.default]
}

export default async function Home() {
  const stories = await getStories()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Global Travel Report</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => (
          <Link href={`/stories/${story.slug}`} key={story.slug}>
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{story.title}</CardTitle>
                <CardDescription>{story.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                {story.imageUrl && (
                  <div className="relative w-full h-48 mb-4">
                    <Image
                      src={story.imageUrl}
                      alt={story.title}
                      fill
                      className="object-cover rounded-md"
                      priority
                    />
                  </div>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{story.author}</span>
                  <span>{story.readTime} min read</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
} 