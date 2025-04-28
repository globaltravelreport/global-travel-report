import { notFound } from 'next/navigation';
import { StoryCard } from '@/components/stories/StoryCard';
import { getStoriesByCategory, getStories, type Story } from '@/lib/stories';
import type { Metadata } from 'next';

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = params.category.charAt(0).toUpperCase() + params.category.slice(1);
  
  return {
    title: `${category} Travel Stories - Global Travel Report`,
    description: `Explore ${category.toLowerCase()} travel stories, tips, and inspiration. Discover the best ${category.toLowerCase()} experiences around the world.`,
    openGraph: {
      title: `${category} Travel Stories - Global Travel Report`,
      description: `Explore ${category.toLowerCase()} travel stories, tips, and inspiration. Discover the best ${category.toLowerCase()} experiences around the world.`,
      type: 'website',
      locale: 'en_US',
      siteName: 'Global Travel Report',
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = params.category.charAt(0).toUpperCase() + params.category.slice(1);
  const allStories = await getStories();
  const stories = getStoriesByCategory(allStories, category);

  if (stories.length === 0) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">{category} Travel Stories</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story: Story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </div>
  );
} 