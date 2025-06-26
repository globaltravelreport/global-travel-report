
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllStories } from '@/utils/stories';
import { StoryCard } from '@/components/stories/StoryCard';
import { CATEGORIES, getCategoryBySlug } from '@/src/config/categories';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryData = getCategoryBySlug(category);
  
  if (!categoryData) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${categoryData.name} Stories | Global Travel Report`,
    description: `Discover amazing ${categoryData.name.toLowerCase()} stories from around the world.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryData = getCategoryBySlug(category);
  
  if (!categoryData) {
    notFound();
  }

  const allStories = await getAllStories();
  const stories = allStories.filter(story => story.category === categoryData.name);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{categoryData.name}</h1>
        <p className="text-lg text-gray-600">{categoryData.description}</p>
      </div>
      
      {stories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map(story => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">No stories found in this category yet.</p>
          <p className="mt-2 text-gray-500">Check back soon for new content!</p>
        </div>
      )}
    </div>
  );
}
