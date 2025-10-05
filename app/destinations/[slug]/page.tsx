import { notFound } from 'next/navigation';
import { StoryCard } from '@/components/stories/StoryCard';
import { getAllStories } from '@/src/utils/stories';
import { Story } from '@/types/Story';
import type { Metadata } from 'next';

// Define the params type for Next.js 15
type DestinationParams = {
  slug: string;
};

/**
 * Parse a destination slug into city and country components
 * @param slug - The destination slug (e.g., 'tokyo-japan', 'santorini-greece')
 * @returns Object with city and country, or null if invalid
 */
function parseDestinationSlug(slug: string): { city: string; country: string } | null {
  if (!slug || typeof slug !== 'string') {
    return null;
  }

  // Split on the last hyphen to separate city from country
  const lastHyphenIndex = slug.lastIndexOf('-');
  if (lastHyphenIndex === -1 || lastHyphenIndex === 0 || lastHyphenIndex === slug.length - 1) {
    return null; // Invalid format
  }

  const city = slug.substring(0, lastHyphenIndex).replace(/-/g, ' ');
  const country = slug.substring(lastHyphenIndex + 1).replace(/-/g, ' ');

  // Capitalize first letter of each word
  const capitalizeWords = (str: string) =>
    str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return {
    city: capitalizeWords(city),
    country: capitalizeWords(country)
  };
}

/**
 * Get stories related to a destination (city or country)
 * @param stories - Array of all stories
 * @param city - City name
 * @param country - Country name
 * @returns Array of matching stories
 */
function getStoriesByDestination(stories: Story[], city: string, country: string): Story[] {
  return stories.filter(story => {
    if (!story) return false;

    const storyCountry = story.country || '';
    const storyTitle = story.title || '';
    const storyExcerpt = story.excerpt || '';
    const storyContent = story.content || '';
    const storyTags = story.tags || [];

    // Check for exact country match
    if (storyCountry.toLowerCase() === country.toLowerCase()) {
      return true;
    }

    // Check if city or country appears in title, excerpt, or content
    const searchTerms = [city.toLowerCase(), country.toLowerCase()];
    const searchableText = (storyTitle + ' ' + storyExcerpt + ' ' + storyContent).toLowerCase();

    if (searchTerms.some(term => searchableText.includes(term))) {
      return true;
    }

    // Check tags
    if (storyTags.some(tag =>
      searchTerms.some(term => tag.toLowerCase().includes(term))
    )) {
      return true;
    }

    return false;
  }).sort((a, b) => {
    // Sort by date (newest first)
    const dateA = a.publishedAt instanceof Date ? a.publishedAt : new Date(a.publishedAt);
    const dateB = b.publishedAt instanceof Date ? b.publishedAt : new Date(b.publishedAt);
    return dateB.getTime() - dateA.getTime();
  });
}

export async function generateMetadata({ params }: { params: DestinationParams }): Promise<Metadata> {
  const parsed = parseDestinationSlug(params.slug);

  if (!parsed) {
    return {
      title: 'Destination Not Found - Global Travel Report',
      description: 'The requested destination could not be found.',
    };
  }

  const { city, country } = parsed;

  return {
    title: `${city}, ${country} Travel Stories - Global Travel Report`,
    description: `Explore travel stories, tips, and inspiration from ${city}, ${country}. Discover the best experiences and destinations in ${city}.`,
    openGraph: {
      title: `${city}, ${country} Travel Stories - Global Travel Report`,
      description: `Explore travel stories, tips, and inspiration from ${city}, ${country}. Discover the best experiences and destinations in ${city}.`,
      type: 'website',
      locale: 'en_US',
      siteName: 'Global Travel Report',
    },
  };
}

export default async function DestinationPage({ params }: { params: DestinationParams }) {
  const parsed = parseDestinationSlug(params.slug);

  if (!parsed) {
    notFound();
  }

  const { city, country } = parsed;
  const allStories = await getAllStories();
  const stories = getStoriesByDestination(allStories, city, country);

  if (stories.length === 0) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">Travel Stories from {city}, {country}</h1>
      <p className="text-xl text-gray-600 mb-8">
        Discover amazing travel experiences and stories from {city}, {country}.
        Find inspiration for your next adventure in this beautiful destination.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story: Story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>

      {stories.length === 0 && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">No stories found</h2>
          <p className="text-gray-600">
            We're working on adding more stories about {city}, {country}. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
}