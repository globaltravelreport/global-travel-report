import { getAllStories } from '@/src/utils/stories';
import { StoryCard } from '@/src/components/stories/StoryCard';
import { CountryDropdown } from '@/src/components/destinations/CountryDropdown';
import { isValidCountry } from '@/src/utils/countries';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { FAQSchema } from '@/src/components/seo/FAQSchema';
import { ClientSuspense } from '@/src/components/ui/ClientSuspense';
import ClientWorldMap from '@/src/components/maps/ClientWorldMap';

export const metadata: Metadata = {
  title: 'Destinations - Global Travel Report',
  description: 'Explore travel destinations from around the world. Find travel guides, tips, and stories for your next adventure.',
  openGraph: {
    title: 'Destinations - Global Travel Report',
    description: 'Explore travel destinations from around the world. Find travel guides, tips, and stories for your next adventure.',
  },
};

// Server component that will be wrapped in a client component with Suspense
async function DestinationsPageContent() {
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

  // Filter out non-country entries and sort by number of stories (descending)
  const allCountries = Object.keys(storiesByCountry);

  // Separate valid countries from regions/other entries
  const validCountryEntries = allCountries.filter(country => isValidCountry(country));
  const otherEntries = allCountries.filter(country => !isValidCountry(country));

  // Sort valid countries by number of stories (descending)
  const sortedValidCountries = validCountryEntries.sort(
    (a, b) => storiesByCountry[b].length - storiesByCountry[a].length
  );

  // Sort other entries by number of stories (descending)
  const sortedOtherEntries = otherEntries.sort(
    (a, b) => storiesByCountry[b].length - storiesByCountry[a].length
  );

  // Combine the sorted lists, with valid countries first
  const sortedCountries = [...sortedValidCountries, ...sortedOtherEntries];

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

      <div className="mb-8">
        <p className="text-xl text-gray-600 max-w-3xl mx-auto text-center">
          Explore our collection of travel stories, guides, and insights from destinations around the world.
          Find inspiration for your next adventure.
        </p>
      </div>

      {sortedCountries.length > 0 ? (
        <>
          {/* Interactive World Map */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">Explore Destinations</h2>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <ClientWorldMap
                highlightedCountries={sortedValidCountries}
                onCountryClick={(country) => {
                  // This will be handled client-side
                  const element = document.getElementById(`country-${country.toLowerCase().replace(/\s+/g, '-')}`);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.location.href = `/countries/${country.toLowerCase().replace(/\s+/g, '-')}`;
                  }
                }}
                height={500}
                showLabels={true}
                enableZoom={true}
                initialZoom={2}
                highlightColor="#3b82f6"
              />
              <div className="p-4 bg-gray-50 text-sm text-gray-500">
                Click on a highlighted country to view stories from that destination
              </div>
            </div>
          </div>

          {/* Country Dropdown Navigation */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-12 shadow-sm">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">Find Stories by Country</h2>
            <CountryDropdown countries={sortedCountries} />
          </div>

          <div className="space-y-16">
            {sortedCountries.map((country) => (
              <section
                key={country}
                id={`country-${country.toLowerCase().replace(/\s+/g, '-')}`}
                className="space-y-6 scroll-mt-24"
              >
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
        </>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">No destinations found</h2>
          <p className="text-gray-600">
            We're working on adding more travel destinations. Check back soon!
          </p>
        </div>
      )}

      {/* FAQ Section with Schema */}
      <FAQSchema
        title="Frequently Asked Travel Questions"
        description="Find answers to common questions about international travel, destinations, and planning your next adventure."
        items={[
          {
            question: "What are the most popular travel destinations in 2024?",
            answer: "The most popular travel destinations in 2024 include Japan, Portugal, Mexico, New Zealand, and Morocco. These destinations offer a mix of cultural experiences, natural beauty, and unique attractions that appeal to a wide range of travelers."
          },
          {
            question: "When is the best time to book international flights?",
            answer: "The best time to book international flights is typically 2-3 months before your departure date for the best prices. For peak travel seasons (summer, holidays), booking 4-6 months in advance is recommended. Tuesday and Wednesday are often the cheapest days to book flights."
          },
          {
            question: "Do I need travel insurance for international trips?",
            answer: "Yes, travel insurance is highly recommended for international trips. It provides coverage for medical emergencies, trip cancellations, lost luggage, and other unexpected events. The cost of medical care abroad can be extremely high, making insurance an essential part of travel planning."
          },
          {
            question: "What documents do I need for international travel?",
            answer: "For international travel, you typically need a passport valid for at least 6 months beyond your return date, any required visas for your destination countries, proof of return or onward travel, and sometimes proof of sufficient funds. Some countries also require proof of vaccinations."
          },
          {
            question: "How can I find authentic local experiences when traveling?",
            answer: "To find authentic local experiences, try staying in residential neighborhoods rather than tourist areas, eat at restaurants frequented by locals, use public transportation, learn a few phrases in the local language, join walking tours led by residents, and use apps that connect travelers with local guides or experiences."
          }
        ]}
      />
    </div>
  );
}

// Export a client component that wraps the server component in a Suspense boundary
export default function DestinationsPage() {
  return (
    <ClientSuspense>
      <DestinationsPageContent />
    </ClientSuspense>
  );
}
