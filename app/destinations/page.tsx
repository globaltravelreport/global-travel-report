import { getAllStories } from '@/src/utils/stories';
import { StoryCard } from '@/src/components/stories/StoryCard';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Destinations - Global Travel Report',
  description: 'Explore travel destinations from around the world. Find travel guides, tips, and stories for your next adventure.',
  openGraph: {
    title: 'Destinations - Global Travel Report',
    description: 'Explore travel destinations from around the world. Find travel guides, tips, and stories for your next adventure.',
  },
};

export default async function DestinationsPage() {
  const allStories = await getAllStories();
  
  // Group stories by country
  const storiesByCountry = allStories.reduce((acc, story) => {
    if (story.country) {
      if (!acc[story.country]) {
        acc[story.country] = [];
      }
      acc[story.country].push(story);
    }
    return acc;
  }, {} as Record<string, typeof allStories>);

  // Sort countries by number of stories (descending)
  const sortedCountries = Object.keys(storiesByCountry).sort(
    (a, b) => storiesByCountry[b].length - storiesByCountry[a].length
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="relative h-[300px] mb-12 rounded-lg overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"
          alt="Explore travel destinations around the world"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-5xl font-bold text-white text-center">Destinations</h1>
        </div>
        <div className="absolute bottom-2 right-2 text-white text-xs bg-black/50 px-2 py-1 rounded">
          Photo by <a 
            href="https://unsplash.com/@jeremybishop" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-gray-200"
          >
            Jeremy Bishop
          </a> on <a 
            href="https://unsplash.com/photos/8xznAGy4HcY" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-gray-200"
          >
            Unsplash
          </a>
        </div>
      </div>

      <div className="mb-12">
        <p className="text-xl text-gray-600 max-w-3xl mx-auto text-center">
          Explore our collection of travel stories, guides, and insights from destinations around the world. 
          Find inspiration for your next adventure.
        </p>
      </div>

      {sortedCountries.length > 0 ? (
        <div className="space-y-16">
          {sortedCountries.map((country) => (
            <section key={country} className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 border-b pb-2">{country}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {storiesByCountry[country].slice(0, 6).map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
              {storiesByCountry[country].length > 6 && (
                <div className="text-center mt-4">
                  <a 
                    href={`/countries/${country.toLowerCase().replace(/\s+/g, '-')}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    View all {country} stories
                  </a>
                </div>
              )}
            </section>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">No destinations found</h2>
          <p className="text-gray-600">
            We're working on adding more travel destinations. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
}
