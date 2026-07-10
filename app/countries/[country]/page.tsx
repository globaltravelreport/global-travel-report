import { notFound } from 'next/navigation';
import { StoryCard } from '@/components/stories/StoryCard';
import { getStoriesByCountry, getAllStories } from '@/src/utils/stories';
import { Story } from '@/types/Story';
import type { Metadata } from 'next';
import { slugify } from '@/src/utils/url';

// Define the params type for Next.js 15
type CountryParams = {
  country: string;
};

export async function generateMetadata({ params }: { params: Promise<CountryParams> }): Promise<Metadata> {
  const { country: countryParam } = await params;
  const country = countryParam.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');

  return {
    title: `${country} Travel Stories`,
    description: `Explore travel stories, tips, and inspiration from ${country}. Discover the best experiences and destinations in ${country}.`,
    openGraph: {
      title: `${country} Travel Stories - Global Travel Report`,
      description: `Explore travel stories, tips, and inspiration from ${country}. Discover the best experiences and destinations in ${country}.`,
      type: 'website',
      locale: 'en_US',
      siteName: 'Global Travel Report',
    },
    alternates: { canonical: `/countries/${slugify(country)}` },
  };
}

export default async function CountryPage({ params }: { params: Promise<CountryParams> }) {
  const { country: countryParam } = await params;
  const country = countryParam.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
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
