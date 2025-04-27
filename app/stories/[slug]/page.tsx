import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent } from '../../../components/ui/card'
import type { Metadata } from 'next'
import type { Story } from '../../../types'

async function getStory(slug: string): Promise<Story | null> {
  try {
    const story = await import(`../../../data/stories/${slug}.json`)
    return story.default
  } catch (error) {
    return null
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const story = await getStory(params.slug)
  if (!story) return { title: 'Story Not Found' }
  
  return {
    title: story.metaTitle || story.title,
    description: story.metaDescription || story.excerpt,
    openGraph: {
      title: story.metaTitle || story.title,
      description: story.metaDescription || story.excerpt,
      images: story.imageUrl ? [story.imageUrl] : [],
    },
  }
}

export default async function StoryPage({ params }: { params: { slug: string } }) {
  const story = await getStory(params.slug)

  if (!story) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <h1 className="text-4xl font-bold mb-4">{story.title}</h1>
          <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
            <span>{story.author}</span>
            <span>{story.readTime} min read</span>
          </div>
          {story.imageUrl && (
            <div className="relative w-full h-96 mb-6">
              <Image
                src={story.imageUrl}
                alt={story.title}
                fill
                className="object-cover rounded-md"
                priority
              />
            </div>
          )}
          <div className="prose max-w-none">
            {story.body}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 