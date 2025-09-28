import { getAllStories } from '@/utils/stories';

// Simple server-side story card component to avoid client-side rendering issues
function SimpleStoryCard({ story }: { story: any }) {
  const imageUrl = story.imageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&q=80&w=2400';
  const _photographer = story.photographer?.name || 'Unknown Photographer';

  return (
    <div className="transition-all duration-300 bg-white hover:shadow-xl border border-gray-100 rounded-xl overflow-hidden group hover:translate-y-[-4px]">
      <a href={`/stories/${story.slug}`} className="block">
        <div className="relative w-full overflow-hidden">
          <img
            src={imageUrl}
            alt={story.title}
            className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold leading-tight tracking-tight text-gray-900 group-hover:text-[#C9A14A] transition-colors mb-3 line-clamp-2">
            {story.title}
          </h3>

          <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed text-sm">{story.excerpt}</p>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{story.publishedAt ? new Date(story.publishedAt).toLocaleDateString() : 'Unknown date'}</span>
            </div>

            {story.country && (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-800">
                {story.country}
              </span>
            )}
          </div>

          {story.tags && story.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-4 mt-4 border-t border-gray-100">
              {story.tags.slice(0, 3).map((tag: string) => (
                <span key={tag} className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-500">By Global Travel Report Editorial Team</span>
            <span className="text-[#C9A14A] text-sm font-medium group-hover:underline">Read More</span>
          </div>
        </div>
      </a>
    </div>
  );
}
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Destinations - Global Travel Report',
  description: 'Explore travel destinations from around the world. Find travel guides, tips, and stories for your next adventure.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaltravelreport.com'}/destinations`,
  },
  openGraph: {
    title: 'Destinations - Global Travel Report',
    description: 'Explore travel destinations from around the world. Find travel guides, tips, and stories for your next adventure.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaltravelreport.com'}/destinations`,
    siteName: 'Global Travel Report',
    images: [
      {
        url: '/images/destinations-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Explore travel destinations around the world',
      },
    ],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@globaltravelreport',
    creator: '@globaltravelreport',
    title: 'Destinations - Global Travel Report',
    description: 'Explore travel destinations from around the world. Find travel guides, tips, and stories for your next adventure.',
    images: ['/images/destinations-hero.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'travel',
  keywords: ['travel destinations', 'travel guides', 'destination guides', 'travel tips', 'world travel', 'travel planning'],
};

// Server component that will be wrapped in a client component with Suspense
async function DestinationsPageContent() {
  console.log('DestinationsPage: Starting to fetch stories...');

  let allStories: any[] = [];
  try {
    allStories = await getAllStories();
    console.log(`DestinationsPage: Fetched ${allStories?.length || 0} stories, type: ${typeof allStories}, isArray: ${Array.isArray(allStories)}`);
  } catch (error) {
    console.error('DestinationsPage: Error fetching stories:', error);
    allStories = [];
  }

  // Ensure allStories is always an array
  if (!Array.isArray(allStories)) {
    console.error('DestinationsPage: allStories is not an array, received:', typeof allStories, allStories);
    allStories = [];
  }

  // Group stories by country
  const storiesByCountry = allStories.reduce((acc, story) => {
    if (story?.country) {
      if (!acc[story.country]) {
        acc[story.country] = [];
      }
      acc[story.country].push(story);
    }
    return acc;
  }, {} as Record<string, typeof allStories>);

  console.log('DestinationsPage: storiesByCountry keys:', Object.keys(storiesByCountry || {}));
  console.log('DestinationsPage: storiesByCountry type:', typeof storiesByCountry);

  // Filter out non-country entries and sort by number of stories (descending)
  const allCountries = Object.keys(storiesByCountry || {});

  // Clean up country names by removing quotes and extra formatting
  const cleanedCountries = allCountries.map(country => country.replace(/['"]+/g, ''));

  // Separate valid countries from regions/other entries
  const validCountryEntries = cleanedCountries.filter(country => {
    const validCountries = ["France", "Japan", "Australia", "Italy", "Spain", "Germany", "United Kingdom", "Canada", "United States", "China", "India", "Brazil", "Mexico", "Thailand", "Greece", "Turkey", "Egypt", "South Africa", "Argentina", "Netherlands", "Belgium", "Switzerland", "Austria", "Sweden", "Norway", "Denmark", "Finland", "Ireland", "Portugal", "New Zealand", "Singapore", "Malaysia", "Indonesia", "Philippines", "Vietnam", "South Korea", "Israel", "Jordan", "Morocco", "Tunisia", "Kenya", "Tanzania", "Uganda", "Botswana", "Namibia", "Zimbabwe", "Peru", "Chile", "Ecuador", "Colombia", "Costa Rica", "Panama", "Guatemala", "Belize", "Cuba", "Jamaica", "Dominican Republic", "Puerto Rico", "Iceland", "Maldives", "Sri Lanka", "Nepal", "Bhutan", "Mongolia", "Russia", "Poland", "Czech Republic", "Hungary", "Romania", "Bulgaria", "Croatia", "Slovenia", "Slovakia", "Estonia", "Latvia", "Lithuania", "Ukraine", "Georgia", "Armenia", "Azerbaijan"];
    return validCountries.includes(country);
  });
  const otherEntries = cleanedCountries.filter(country => {
    const validCountries = ["France", "Japan", "Australia", "Italy", "Spain", "Germany", "United Kingdom", "Canada", "United States", "China", "India", "Brazil", "Mexico", "Thailand", "Greece", "Turkey", "Egypt", "South Africa", "Argentina", "Netherlands", "Belgium", "Switzerland", "Austria", "Sweden", "Norway", "Denmark", "Finland", "Ireland", "Portugal", "New Zealand", "Singapore", "Malaysia", "Indonesia", "Philippines", "Vietnam", "South Korea", "Israel", "Jordan", "Morocco", "Tunisia", "Kenya", "Tanzania", "Uganda", "Botswana", "Namibia", "Zimbabwe", "Peru", "Chile", "Ecuador", "Colombia", "Costa Rica", "Panama", "Guatemala", "Belize", "Cuba", "Jamaica", "Dominican Republic", "Puerto Rico", "Iceland", "Maldives", "Sri Lanka", "Nepal", "Bhutan", "Mongolia", "Russia", "Poland", "Czech Republic", "Hungary", "Romania", "Bulgaria", "Croatia", "Slovenia", "Slovakia", "Estonia", "Latvia", "Lithuania", "Ukraine", "Georgia", "Armenia", "Azerbaijan"];
    return !validCountries.includes(country);
  });

  // Sort valid countries by number of stories (descending)
  const sortedValidCountries = validCountryEntries.sort(
    (a, b) => {
      // Get the original country key to access the stories
      const countryKeyA = allCountries.find(c => c.replace(/['"]+/g, '') === a) || a;
      const countryKeyB = allCountries.find(c => c.replace(/['"]+/g, '') === b) || b;
      const storiesA = storiesByCountry?.[countryKeyA] || [];
      const storiesB = storiesByCountry?.[countryKeyB] || [];
      return storiesB.length - storiesA.length;
    }
  );

  // Sort other entries by number of stories (descending)
  const sortedOtherEntries = otherEntries.sort(
    (a, b) => {
      // Get the original country key to access the stories
      const countryKeyA = allCountries.find(c => c.replace(/['"]+/g, '') === a) || a;
      const countryKeyB = allCountries.find(c => c.replace(/['"]+/g, '') === b) || b;
      const storiesA = storiesByCountry?.[countryKeyA] || [];
      const storiesB = storiesByCountry?.[countryKeyB] || [];
      return storiesB.length - storiesA.length;
    }
  );

  // Combine the sorted lists, with valid countries first
  const sortedCountries = [...(sortedValidCountries || []), ...(sortedOtherEntries || [])];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="relative h-[300px] mb-12 rounded-lg overflow-hidden">
        <img
          src="/images/destinations-hero.jpg"
          alt="Explore travel destinations around the world"
          className="w-full h-full object-cover"
          loading="eager"
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
            href="https://unsplash.com"
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
          {/* Simple Country List */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">Explore Destinations</h2>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
              <p className="text-center text-gray-600 mb-4">Browse our collection of travel stories by destination</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sortedCountries.slice(0, 12).map((country) => (
                  <a
                    key={country}
                    href={`/countries/${country.toLowerCase().replace(/\s+/g, '-')}`}
                    className="block p-4 bg-gray-50 hover:bg-blue-50 rounded-lg text-center transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-900">{country}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-16">
            {(sortedCountries || []).map((country) => {
              // Get the original country key to access the stories
              const originalCountryKey = allCountries.find(c => c.replace(/['"]+/g, '') === country) || country;

              return (
                <section
                  key={country}
                  id={`country-${country.toLowerCase().replace(/\s+/g, '-')}`}
                  className="space-y-6 scroll-mt-24"
                >
                  <h2 className="text-3xl font-bold text-gray-900 border-b pb-2">{country}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {(storiesByCountry[originalCountryKey] || []).slice(0, 6).map((story) => (
                      <SimpleStoryCard key={story?.id} story={story} />
                    ))}
                  </div>
                  {(storiesByCountry[originalCountryKey] || []).length > 6 && (
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
              );
            })}
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

      {/* Simple FAQ Section */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Frequently Asked Travel Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">What are the most popular travel destinations in 2024?</h3>
            <p className="text-gray-600">The most popular travel destinations in 2024 include Japan, Portugal, Mexico, New Zealand, and Morocco. These destinations offer a mix of cultural experiences, natural beauty, and unique attractions.</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">When is the best time to book international flights?</h3>
            <p className="text-gray-600">The best time to book international flights is typically 2-3 months before your departure date for the best prices. For peak travel seasons, booking 4-6 months in advance is recommended.</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Do I need travel insurance for international trips?</h3>
            <p className="text-gray-600">Yes, travel insurance is highly recommended for international trips. It provides coverage for medical emergencies, trip cancellations, lost luggage, and other unexpected events.</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">How can I find authentic local experiences?</h3>
            <p className="text-gray-600">To find authentic local experiences, try staying in residential neighborhoods, eat at local restaurants, use public transportation, and learn a few phrases in the local language.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export the server component directly
export default function DestinationsPage() {
  return <DestinationsPageContent />;
}
