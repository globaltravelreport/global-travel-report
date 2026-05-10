/**
 * Official category taxonomy for Global Travel Report.
 *
 * Keep this list small and editorial. Aliases below preserve older URLs,
 * imported stories, and previous AI labels without exposing duplicate sections.
 */

export interface Category {
  name: string;
  slug: string;
  description: string;
  icon: string;
  keywords: string[];
  featured: boolean;
  parent?: string;
}

export const CATEGORIES: Category[] = [
  {
    name: 'Air Travel',
    slug: 'air-travel',
    description: 'Airline, airport, aviation, route, lounge, and passenger experience news.',
    icon: '✈️',
    keywords: ['airline', 'flight', 'airport', 'aviation', 'aircraft', 'route', 'lounge'],
    featured: true
  },
  {
    name: 'Cruise',
    slug: 'cruise',
    description: 'Ocean, expedition, and river cruise news, ships, ports, and itineraries.',
    icon: '🚢',
    keywords: ['cruise', 'ship', 'voyage', 'port', 'sailing', 'river cruise'],
    featured: true
  },
  {
    name: 'Accommodation',
    slug: 'accommodation',
    description: 'Hotels, resorts, lodges, villas, and places to stay around the world.',
    icon: '🏨',
    keywords: ['hotel', 'resort', 'accommodation', 'stay', 'lodging', 'suite', 'villa'],
    featured: true
  },
  {
    name: 'Destinations',
    slug: 'destinations',
    description: 'Country, city, island, region, and destination guides and news.',
    icon: '🌍',
    keywords: ['destination', 'place', 'location', 'country', 'city', 'region', 'island'],
    featured: true
  },
  {
    name: 'Tours',
    slug: 'tours',
    description: 'Tours, activities, attractions, guided experiences, rail journeys, and itineraries.',
    icon: '🧭',
    keywords: ['tour', 'itinerary', 'guide', 'excursion', 'experience', 'activity', 'rail', 'train'],
    featured: true
  },
  {
    name: 'Travel Deals',
    slug: 'travel-deals',
    description: 'Deals, offers, fares, discounts, sale periods, and good-value travel opportunities.',
    icon: '🏷️',
    keywords: ['deal', 'sale', 'discount', 'offer', 'fare', 'value', 'budget'],
    featured: true
  },
  {
    name: 'Travel Safety',
    slug: 'travel-safety',
    description: 'Travel warnings, visa rules, passport updates, health advice, and security alerts.',
    icon: '🛡️',
    keywords: ['warning', 'advice', 'visa', 'passport', 'safety', 'alert', 'security', 'health'],
    featured: true
  },
  {
    name: 'Food & Drink',
    slug: 'food-drink',
    description: 'Restaurants, food tours, wine regions, bars, culinary travel, and local flavours.',
    icon: '🍽️',
    keywords: ['food', 'drink', 'dining', 'restaurant', 'cuisine', 'culinary', 'wine', 'bar'],
    featured: true
  },
  {
    name: 'Luxury Travel',
    slug: 'luxury-travel',
    description: 'Premium cabins, high-end stays, luxury journeys, and exclusive travel experiences.',
    icon: '💎',
    keywords: ['luxury', 'premium', 'first class', 'business class', 'high-end', 'exclusive'],
    featured: true
  },
  {
    name: 'Sustainable Travel',
    slug: 'sustainable-travel',
    description: 'Responsible travel, sustainability, low-impact tourism, and conservation-led trips.',
    icon: '🌿',
    keywords: ['sustainable', 'eco', 'responsible', 'carbon', 'green', 'conservation'],
    featured: true
  },
  {
    name: 'Travel Tech',
    slug: 'travel-tech',
    description: 'Travel apps, eSIMs, booking technology, digital tools, and connected travel.',
    icon: '📱',
    keywords: ['app', 'technology', 'digital', 'esim', 'wifi', 'booking platform', 'online'],
    featured: true
  },
  {
    name: 'Finance & Points',
    slug: 'finance-points',
    description: 'Travel money, cards, points, miles, insurance, currency, and rewards programs.',
    icon: '💳',
    keywords: ['points', 'miles', 'credit card', 'currency', 'bank', 'insurance', 'money', 'rewards'],
    featured: true
  },
  {
    name: 'Travel News',
    slug: 'travel-news',
    description: 'General travel industry updates and stories that do not fit a specialist section.',
    icon: '📰',
    keywords: ['travel news', 'tourism', 'industry', 'update', 'announcement'],
    featured: true
  }
];

const CATEGORY_ALIASES: Record<string, string> = {
  accommodation: 'accommodation',
  adventure: 'tours',
  'adventure travel': 'tours',
  airline: 'air-travel',
  airlines: 'air-travel',
  'air travel': 'air-travel',
  'air-travel': 'air-travel',
  aviation: 'air-travel',
  budget: 'travel-deals',
  'budget travel': 'travel-deals',
  culture: 'destinations',
  cruise: 'cruise',
  cruises: 'cruise',
  'cruise lines': 'cruise',
  'cruise ships': 'cruise',
  deals: 'travel-deals',
  destinations: 'destinations',
  'eco tourism': 'sustainable-travel',
  'eco-tourism': 'sustainable-travel',
  family: 'tours',
  'family travel': 'tours',
  finance: 'finance-points',
  'finance & points': 'finance-points',
  'finance and points': 'finance-points',
  flights: 'air-travel',
  food: 'food-drink',
  'food & dining': 'food-drink',
  'food & drink': 'food-drink',
  'food and dining': 'food-drink',
  'food and drink': 'food-drink',
  'food-dining': 'food-drink',
  'food-drink': 'food-drink',
  'food wine': 'food-drink',
  'food & wine': 'food-drink',
  global: 'travel-news',
  hotel: 'accommodation',
  hotels: 'accommodation',
  insurance: 'finance-points',
  luxury: 'luxury-travel',
  'luxury travel': 'luxury-travel',
  nature: 'destinations',
  rail: 'tours',
  safety: 'travel-safety',
  shopping: 'travel-deals',
  'solo travel': 'tours',
  sustainability: 'sustainable-travel',
  'sustainable travel': 'sustainable-travel',
  tech: 'travel-tech',
  tours: 'tours',
  travel: 'travel-news',
  'travel deals': 'travel-deals',
  'travel news': 'travel-news',
  'travel safety': 'travel-safety',
  'travel tech': 'travel-tech',
  'travel tips': 'travel-news',
  'travel-tips': 'travel-news',
  wellness: 'tours',
  'wellness & spa': 'tours'
};

export function slugifyCategory(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function normaliseLookupKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function normalizeCategorySlug(value?: string | null): string {
  if (!value) {
    return 'travel-news';
  }

  const lookupKey = normaliseLookupKey(value);
  const slug = slugifyCategory(value);
  return CATEGORY_ALIASES[lookupKey] || CATEGORY_ALIASES[slug] || slug;
}

export function getCategoryBySlug(slug: string): Category | undefined {
  const canonicalSlug = normalizeCategorySlug(slug);
  return CATEGORIES.find(category => category.slug === canonicalSlug);
}

export function getCategoryByName(name: string): Category | undefined {
  const canonicalSlug = normalizeCategorySlug(name);
  return CATEGORIES.find(category => category.slug === canonicalSlug);
}

export function normalizeCategoryName(value?: string | null): string {
  return getCategoryBySlug(value || '')?.name || 'Travel News';
}

export function getFeaturedCategories(): Category[] {
  return CATEGORIES.filter(category => category.featured);
}

export function getSubcategories(parentSlug: string): Category[] {
  const canonicalSlug = normalizeCategorySlug(parentSlug);
  return CATEGORIES.filter(category => category.parent === canonicalSlug);
}

export function categoryMatches(storyCategory: string | undefined | null, requestedCategory: string): boolean {
  if (!storyCategory || !requestedCategory) {
    return false;
  }

  return normalizeCategorySlug(storyCategory) === normalizeCategorySlug(requestedCategory);
}

export function findBestMatchingCategory(input: string): Category | undefined {
  if (!input) {
    return undefined;
  }

  const directMatch = getCategoryBySlug(input) || getCategoryByName(input);
  if (directMatch) {
    return directMatch;
  }

  const normalizedInput = input.toLowerCase();
  return CATEGORIES.find(category =>
    category.keywords.some(keyword => normalizedInput.includes(keyword.toLowerCase()))
  );
}

export default CATEGORIES;
