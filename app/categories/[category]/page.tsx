import { type Metadata } from 'next';
import { getStories } from '@/src/lib/stories';
import { StoryCard } from '@/src/components/stories/StoryCard';

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  return {
    title: `${params.category} Stories - Global Travel Report`,
    description: `Read travel stories about ${params.category} from around the world.`,
  };
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const stories = await getStories();
  const categoryStories = stories.filter(
    (story) => story.category.toLowerCase() === params.category.toLowerCase()
  );

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
    </div>
  );
}