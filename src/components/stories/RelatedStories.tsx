import { StoryCard } from './StoryCard'
import type { Story } from '@/lib/stories'

interface RelatedStoriesProps {
  currentStory: Story
  allStories: Story[]
}

export function RelatedStories({ currentStory, allStories }: RelatedStoriesProps) {
  // Find related stories based on country, category, and tags
  const relatedStories = allStories
    .filter(story => 
      story.id !== currentStory.id && (
        story.country === currentStory.country ||
        story.category === currentStory.category ||
        story.tags.some(tag => currentStory.tags.includes(tag))
      )
    )
    .slice(0, 3) // Get top 3 matches

  // If we don't have enough related stories, add recent stories as fallback
  const recentStories = allStories
    .filter(story => 
      story.id !== currentStory.id && 
      !relatedStories.some(related => related.id === story.id)
    )
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 3 - relatedStories.length)

  const storiesToShow = [...relatedStories, ...recentStories]

  if (storiesToShow.length === 0) {
    return null
  }

  return (
    <section className="mt-12" aria-labelledby="related-stories-heading">
      <h2 id="related-stories-heading" className="text-2xl font-semibold mb-6">
        Related Stories
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {storiesToShow.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </section>
  )
} 