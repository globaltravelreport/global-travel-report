
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllStories } from '@/utils/stories';
import { StoryCard } from '@/components/stories/StoryCard';
import { mockCategories } from '@/src/mocks/stories';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = mockCategories.find(cat => cat.slug === slug);
  
  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.name} Stories | Global Travel Report`,
    description: `Discover amazing ${category.name.toLowerCase()} stories from around the world.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = mockCategories.find(cat => cat.slug === slug);
  
  if (!category) {
    notFound();
  }

  const allStories = await getAllStories();
  const stories = allStories.filter(story => story.category === category.name);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{category.name}</h1>
        <p className="text-lg text-gray-600">{category.description}</p>
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
