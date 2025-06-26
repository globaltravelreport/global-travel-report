
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllStories } from '@/utils/stories';
import { StoryCard } from '@/components/stories/StoryCard';
import { mockCountries } from '@/src/mocks/stories';

interface CountryParams {
  country: string;
}

interface CountryPageProps {
  params: Promise<CountryParams>;
}

export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
  const { country } = await params;
  const countryData = mockCountries.find(c => c.slug === country);
  
  if (!countryData) {
    return {
      title: 'Country Not Found',
    };
  }

  return {
    title: `${countryData.name} Travel Stories | Global Travel Report`,
    description: `Explore travel stories and experiences from ${countryData.name}.`,
  };
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { country } = await params;
  const countryData = mockCountries.find(c => c.slug === country);
  
  if (!countryData) {
    notFound();
  }

  const allStories = await getAllStories();
  const stories = allStories.filter(story => story.country === countryData.name);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Travel Stories from {countryData.name}</h1>
        <p className="text-lg text-gray-600">Discover amazing travel experiences and stories from {countryData.name}.</p>
      </div>
      
      {stories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map(story => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">No stories found for {countryData.name} yet.</p>
          <p className="mt-2 text-gray-500">Check back soon for new content!</p>
        </div>
      )}
    </div>
  );
}
