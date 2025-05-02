import { type Metadata } from 'next';
import { getAllStories, getStoriesByCategory } from '@/src/utils/stories';
import { StoryCard } from '@/src/components/stories/StoryCard';
import { PopularStories } from '@/components/recommendations/PopularStories';
import { Suspense } from 'react';

// Define the params type for Next.js 15
type CategoryParams = {
  category: string;
};

export async function generateMetadata({
  params,
}: {
  params: CategoryParams;
}): Promise<Metadata> {
  return {
    title: `${params.category} Stories - Global Travel Report`,
    description: `Read travel stories about ${params.category} from around the world.`,
  };
}

export default async function CategoryPage({ params }: { params: CategoryParams }) {
  const stories = await getAllStories();
  const categoryStoriesResult = getStoriesByCategory(stories, params.category);
  const categoryStories = categoryStoriesResult.data;

  if (categoryStories.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 capitalize">{params.category}</h1>
        <p className="text-gray-600">No stories found for this category.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 capitalize">{params.category}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categoryStories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>

      {/* Popular Stories Section */}
      <div className="mt-16">
        <Suspense fallback={<div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-80"></div>
            ))}
          </div>
        </div>}>
          <PopularStories limit={3} title="You Might Also Like" />
        </Suspense>
      </div>
    </div>
  );
}