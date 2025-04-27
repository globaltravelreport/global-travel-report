import { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getStoryBySlug } from '../../../lib/stories'
import { formatDate } from '../../../utils/date'
import { Card } from "@/components/ui/card"
import type { Story } from "@/app/types/story"

interface StoryPageProps {
  params: {
    slug: string
  }
}

// This would typically come from an API or database
const getStory = async (slug: string): Promise<Story | null> => {
  // Mock data for demonstration
  const stories: Record<string, Story> = {
    "exploring-kyoto": {
      id: "1",
      slug: "exploring-kyoto",
      title: "Exploring the Hidden Temples of Kyoto",
      excerpt: "A journey through ancient Japanese architecture and culture...",
      content: `
        Kyoto, the former capital of Japan, is home to thousands of temples and shrines, 
        each with its own unique story and architectural beauty. During my recent visit, 
        I had the privilege of exploring some of the lesser-known temples tucked away in 
        quiet neighborhoods.

        One particularly memorable discovery was a small temple hidden behind a bamboo grove. 
        The morning light filtering through the leaves created an almost magical atmosphere, 
        and the only sounds were the gentle rustling of leaves and distant temple bells.

        The temple's caretaker, an elderly monk who had lived there for over four decades, 
        shared fascinating stories about the temple's history and the daily rituals that 
        keep these ancient traditions alive.
      `,
      author: "Sarah Johnson",
      date: "2024-03-15",
      location: "Kyoto, Japan",
      imageUrl: "/images/kyoto-temple.jpg",
      publishedAt: "2024-03-15",
    },
  }

  return stories[slug] || null
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const story = await getStory(params.slug)
  
  if (!story) {
    return {}
  }

  return {
    title: story.title,
    description: story.excerpt,
    openGraph: {
      title: story.title,
      description: story.excerpt,
      type: 'article',
      publishedTime: story.publishedAt,
      authors: [story.author],
    },
  }
}

export default async function StoryPage({ params }: StoryPageProps) {
  const story = await getStory(params.slug)

  if (!story) {
    notFound()
  }

  return (
    <article className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="relative aspect-video w-full mb-6">
          <Image
            src={story.imageUrl}
            alt={story.title}
            fill
            className="object-cover rounded-lg"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>

        <h1 className="text-4xl font-bold mb-4">{story.title}</h1>
        
        <div className="flex items-center justify-between text-gray-600 mb-8">
          <div>
            <p className="font-medium">{story.author}</p>
            <p>{story.location}</p>
          </div>
          <time dateTime={story.date}>{story.date}</time>
        </div>
      </div>

      <Card className="p-8">
        <div className="prose prose-lg max-w-none">
          {story.content.split("\n").map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph.trim()}
            </p>
          ))}
        </div>
      </Card>
    </article>
  )
} 