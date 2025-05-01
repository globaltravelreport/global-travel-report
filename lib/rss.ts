import { Story } from '@/types/Story';

/**
 * Mock function to generate sample stories
 * In a production environment, this would fetch from actual RSS feeds
 * @returns A promise resolving to an array of stories
 */
export async function fetchRSSFeeds(): Promise<Story[]> {
  // Generate mock stories instead of fetching from RSS feeds
  // This avoids using Node.js-specific modules that aren't available in Edge Runtime

  const mockStories: Story[] = [
    // Cruise stories
    {
      id: 'cruise-story-1',
      slug: 'mediterranean-cruise-guide-2024',
      title: 'Mediterranean Cruise Guide 2024: Best Ports and Itineraries',
      excerpt: 'Discover the most stunning Mediterranean cruise destinations for 2024, from the sun-drenched Greek Islands to the cultural treasures of Italy and Spain.',
      content: 'Full content would go here...',
      author: 'Global Travel Report Editorial Team',
      category: 'Cruises',
      country: 'Italy',
      tags: ['mediterranean', 'cruise', 'europe', 'travel guide'],
      featured: true,
      editorsPick: true,
      publishedAt: new Date().toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    },
    {
      id: 'cruise-story-2',
      slug: 'alaska-cruise-adventures',
      title: 'Alaska Cruise Adventures: Glaciers, Wildlife, and Breathtaking Scenery',
      excerpt: 'Experience the majesty of Alaska\'s wilderness from the comfort of a cruise ship, with opportunities to see glaciers calving, whales breaching, and bears fishing for salmon.',
      content: 'Full content would go here...',
      author: 'Global Travel Report Editorial Team',
      category: 'Cruises',
      country: 'United States',
      tags: ['alaska', 'cruise', 'wildlife', 'nature'],
      featured: false,
      editorsPick: true,
      publishedAt: new Date().toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1531176175280-c0214c0b1444?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    },

    // Other travel stories
    {
      id: 'travel-story-1',
      slug: 'hidden-gems-of-japan',
      title: 'Hidden Gems of Japan: Beyond Tokyo and Kyoto',
      excerpt: 'Venture off the beaten path to discover Japan\'s lesser-known but equally enchanting destinations, from the snow monkeys of Nagano to the tropical beaches of Okinawa.',
      content: 'Full content would go here...',
      author: 'Global Travel Report Editorial Team',
      category: 'Destinations',
      country: 'Japan',
      tags: ['japan', 'asia', 'off the beaten path', 'travel guide'],
      featured: true,
      editorsPick: false,
      publishedAt: new Date().toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    },
    {
      id: 'travel-story-2',
      slug: 'luxury-safari-lodges-africa',
      title: 'Africa\'s Most Luxurious Safari Lodges: Where Wildlife Meets Opulence',
      excerpt: 'Experience the ultimate in safari luxury at these exclusive lodges, where you can watch elephants from your private plunge pool and dine under the stars.',
      content: 'Full content would go here...',
      author: 'Global Travel Report Editorial Team',
      category: 'Luxury',
      country: 'South Africa',
      tags: ['safari', 'luxury', 'africa', 'wildlife'],
      featured: false,
      editorsPick: true,
      publishedAt: new Date().toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    },
    {
      id: 'travel-story-3',
      slug: 'budget-travel-southeast-asia',
      title: 'Southeast Asia on a Budget: Maximize Experiences, Minimize Costs',
      excerpt: 'Discover how to explore the vibrant cultures, stunning landscapes, and delicious cuisines of Southeast Asia without breaking the bank.',
      content: 'Full content would go here...',
      author: 'Global Travel Report Editorial Team',
      category: 'Budget Travel',
      country: 'Thailand',
      tags: ['budget', 'southeast asia', 'backpacking', 'travel tips'],
      featured: false,
      editorsPick: false,
      publishedAt: new Date().toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    },
    {
      id: 'travel-story-4',
      slug: 'family-friendly-european-cities',
      title: '5 Family-Friendly European Cities That Both Parents and Kids Will Love',
      excerpt: 'Plan your next family vacation to these European cities that offer the perfect blend of history, culture, and kid-friendly attractions.',
      content: 'Full content would go here...',
      author: 'Global Travel Report Editorial Team',
      category: 'Family Travel',
      country: 'France',
      tags: ['family', 'europe', 'cities', 'kid-friendly'],
      featured: false,
      editorsPick: false,
      publishedAt: new Date().toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    },
  ];

  return mockStories;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function determineCategory(categories: string[]): string {
  const categoryMap: Record<string, string> = {
    'hotel': 'Hotels',
    'airline': 'Airlines',
    'cruise': 'Cruises',
    'destination': 'Destinations',
    'food': 'Food & Dining',
    'adventure': 'Adventure',
    'culture': 'Culture',
    'shopping': 'Shopping',
    'nightlife': 'Nightlife',
    'family': 'Family Travel',
    'luxury': 'Luxury Travel',
    'budget': 'Budget Travel',
    'solo': 'Solo Travel',
    'honeymoon': 'Honeymoon',
    'business': 'Business Travel',
    'eco': 'Eco Tourism',
    'wellness': 'Wellness & Spa',
  };

  for (const category of categories) {
    const lowerCategory = category.toLowerCase();
    for (const [key, value] of Object.entries(categoryMap)) {
      if (lowerCategory.includes(key)) {
        return value;
      }
    }
  }

  return 'Destinations';
}

function determineCountry(title: string, content: string): string {
  const text = `${title} ${content}`.toLowerCase();
  const countries = [
    'australia', 'japan', 'united states', 'united kingdom', 'france',
    'italy', 'spain', 'germany', 'canada', 'new zealand', 'thailand',
    'vietnam', 'singapore', 'malaysia', 'indonesia', 'china', 'india',
    'south africa', 'brazil', 'mexico'
  ];

  for (const country of countries) {
    if (text.includes(country)) {
      return country.charAt(0).toUpperCase() + country.slice(1);
    }
  }

  return 'Global';
}