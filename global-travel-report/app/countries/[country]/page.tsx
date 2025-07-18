import { notFound } from 'next/navigation';
import { StoryCard } from '@/components/stories/StoryCard';
import { getStoriesByCountry, getAllStories } from '@/utils/stories';
import { Story } from '@/types/Story';
import type { Metadata } from 'next';

// Define the params type for Next.js 15
type CountryParams = {
  country: string;
};

export async function generateMetadata({ params }: { params: CountryParams }): Promise<Metadata> {
  const country = params.country.charAt(0).toUpperCase() + params.country.slice(1);

  return {
    title: `${country} Travel Stories - Global Travel Report`,
    description: `Explore travel stories, tips, and inspiration from ${country}. Discover the best experiences and destinations in ${country}.`,
    openGraph: {
      title: `${country} Travel Stories - Global Travel Report`,
      description: `Explore travel stories, tips, and inspiration from ${country}. Discover the best experiences and destinations in ${country}.`,
      type: 'website',
      locale: 'en_US',
      siteName: 'Global Travel Report',
    },
  };
}

export default async function CountryPage({ params }: { params: CountryParams }) {
  const country = params.country.charAt(0).toUpperCase() + params.country.slice(1);
  const allStories = await getAllStories();
  const storiesResult = getStoriesByCountry(allStories, country);
  const stories = storiesResult.data;

  if (stories.length === 0) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Travel Stories from {country}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story: Story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </div>
  );
}