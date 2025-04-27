import Image from 'next/image'
import Link from 'next/link'
import { Story } from '../../types/Story'
import { formatDate } from '../../utils/date'
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

interface StoryCardProps {
  story: Story
  priority?: boolean
}

export function StoryCard({ story, priority = false }: StoryCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
        <Image
          src={story.coverImage?.url || story.imageUrl}
          alt={story.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardHeader>
        <h3 className="text-xl font-semibold line-clamp-2">
          <Link href={`/stories/${story.slug}`} className="hover:text-blue-600">
            {story.title}
          </Link>
        </h3>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 line-clamp-3">{story.excerpt}</p>
      </CardContent>
      <CardFooter className="flex justify-between text-sm text-gray-500">
        <span>{story.author?.name}</span>
        <span>{formatDate(story.publishedAt)}</span>
      </CardFooter>
    </Card>
  )
} 