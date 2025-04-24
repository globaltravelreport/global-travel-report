'use client'

import { Story } from '../lib/stories'
import StoryCard from './StoryCard'

interface RelatedStoriesProps {
  currentStory: Story
  stories: Story[]
  maxStories?: number
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function RelatedStories({ currentStory, stories, maxStories = 3 }: RelatedStoriesProps) {
  // Filter out the current story
  const otherStories = stories.filter(story => story.slug !== currentStory.slug)

  // Find stories with matching country or type
  const matchingStories = otherStories.filter(story => 
    story.country === currentStory.country || story.type === currentStory.type
  )

  // If we don't have enough matching stories, get recent stories as fallback
  let relatedStories = matchingStories
  if (matchingStories.length < maxStories) {
    const recentStories = otherStories
      .filter(story => !matchingStories.includes(story))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, maxStories - matchingStories.length)
    
    relatedStories = [...matchingStories, ...recentStories]
  }

  // Slightly randomize the order while keeping matching stories first
  const matchingCount = Math.min(matchingStories.length, maxStories)
  const randomizedStories = [
    ...shuffleArray(relatedStories.slice(0, matchingCount)),
    ...relatedStories.slice(matchingCount)
  ].slice(0, maxStories)

  if (randomizedStories.length === 0) {
    return null
  }

  return (
    <div className="py-12 border-t border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Stories</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {randomizedStories.map(story => (
          <StoryCard key={story.slug} story={story} showTags={false} />
        ))}
      </div>
    </div>
  )
} 