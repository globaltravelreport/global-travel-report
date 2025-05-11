import React from 'react';
import { StoryCard } from '@/src/components/stories/StoryCard';
import type { Story } from '@/types/Story';

interface RelatedStoriesProps {
  currentStory: Story;
  allStories: Story[];
}

export const RelatedStories: React.FC<RelatedStoriesProps> = ({ currentStory, allStories }) => {
  const relatedStories = React.useMemo(() => {
    return allStories
      .filter(story => story.id !== currentStory.id)
      .map(story => {
        let score = 0;

        // Score based on category match
        if (story.category === currentStory.category) {
          score += 3;
        }

        // Score based on country match
        if (story.country === currentStory.country) {
          score += 2;
        }

        // Score based on tag matches
        const commonTags = story.tags.filter(tag => currentStory.tags.includes(tag));
        score += commonTags.length;

        return { story, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ story }) => story);
  }, [currentStory, allStories]);

  if (relatedStories.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Related Stories</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedStories.map(story => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </section>
  );
};