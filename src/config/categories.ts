/**
 * Standardized category system for Global Travel Report
 * 
 * This file defines the official categories used throughout the site,
 * including their display names, slugs, descriptions, and icons.
 */

export interface Category {
  name: string;        // Display name (e.g., "Cruise Ships")
  slug: string;        // URL slug (e.g., "cruise-ships")
  description: string; // Short description for category pages
  icon: string;        // Emoji icon for visual representation
  keywords: string[];  // Related keywords for matching
  featured: boolean;   // Whether to feature in homepage/navigation
  parent?: string;     // Optional parent category slug
}

/**
 * Main categories used throughout the site
 */
export const CATEGORIES: Category[] = [
  // Main travel categories
  {
    name: 'Cruises',
    slug: 'cruises',
    description: 'Ocean and river cruise experiences, reviews, and news',
    icon: '🚢',
    keywords: ['cruise', 'ship', 'ocean', 'river', 'sailing', 'boat'],
    featured: true
  },
  {
    name: 'Cruise Ships',
    slug: 'cruise-ships',
    description: 'Reviews and information about specific cruise ships',
    icon: '🚢',
    keywords: ['cruise ship', 'vessel', 'liner', 'fleet'],
    featured: false,
    parent: 'cruises'
  },
  {
    name: 'Cruise Lines',
    slug: 'cruise-lines',
    description: 'News and information about cruise companies',
    icon: '🚢',
    keywords: ['cruise line', 'company', 'carnival', 'royal caribbean', 'norwegian'],
    featured: false,
    parent: 'cruises'
  },
  {
    name: 'River Cruises',
    slug: 'river-cruises',
    description: 'Experiences and reviews of river cruises worldwide',
    icon: '⛵',
    keywords: ['river cruise', 'danube', 'nile', 'amazon', 'rhine', 'mekong'],
    featured: false,
    parent: 'cruises'
  },
  {
    name: 'Airlines',
    slug: 'airlines',
    description: 'Airline reviews, news, and flight experiences',
    icon: '✈️',
    keywords: ['airline', 'flight', 'airplane', 'aviation', 'airport'],
    featured: true
  },
  {
    name: 'Hotels',
    slug: 'hotels',
    description: 'Hotel reviews, luxury stays, and accommodation tips',
    icon: '🏨',
    keywords: ['hotel', 'resort', 'accommodation', 'stay', 'lodging'],
    featured: true
  },
  {
    name: 'Destinations',
    slug: 'destinations',
    description: 'Guides and stories about travel destinations worldwide',
    icon: '🌍',
    keywords: ['destination', 'place', 'location', 'country', 'city', 'region'],
    featured: true
  },
  {
    name: 'Travel Tips',
    slug: 'travel-tips',
    description: 'Practical advice and tips for travelers',
    icon: '💡',
    keywords: ['tips', 'advice', 'guide', 'how-to', 'planning'],
    featured: true
  },
  {
    name: 'Food & Dining',
    slug: 'food-dining',
    description: 'Culinary experiences and food-focused travel',
    icon: '🍽️',
    keywords: ['food', 'dining', 'restaurant', 'cuisine', 'culinary', 'gastronomy'],
    featured: true
  },
  {
    name: 'Adventure',
    slug: 'adventure',
    description: 'Thrilling experiences and adventure travel',
    icon: '🧗',
    keywords: ['adventure', 'outdoor', 'extreme', 'hiking', 'climbing', 'safari'],
    featured: true
  },
  {
    name: 'Culture',
    slug: 'culture',
    description: 'Cultural experiences, history, and heritage travel',
    icon: '🏛️',
    keywords: ['culture', 'history', 'heritage', 'museum', 'art', 'tradition'],
    featured: true
  },
  {
    name: 'Nature',
    slug: 'nature',
    description: 'Nature-focused travel and outdoor experiences',
    icon: '🌲',
    keywords: ['nature', 'wildlife', 'national park', 'landscape', 'outdoor'],
    featured: true
  },
  {
    name: 'Luxury Travel',
    slug: 'luxury-travel',
    description: 'Premium travel experiences and luxury destinations',
    icon: '💎',
    keywords: ['luxury', 'premium', 'high-end', 'exclusive', 'five-star'],
    featured: true
  },
  {
    name: 'Budget Travel',
    slug: 'budget-travel',
    description: 'Tips and destinations for traveling on a budget',
    icon: '💰',
    keywords: ['budget', 'affordable', 'cheap', 'backpacking', 'value'],
    featured: true
  },
  {
    name: 'Family Travel',
    slug: 'family-travel',
    description: 'Travel ideas and tips for families with children',
    icon: '👨‍👩‍👧‍👦',
    keywords: ['family', 'kids', 'children', 'parents', 'multi-generational'],
    featured: true
  },
  {
    name: 'Solo Travel',
    slug: 'solo-travel',
    description: 'Advice and experiences for solo travelers',
    icon: '🧳',
    keywords: ['solo', 'alone', 'independent', 'single'],
    featured: false
  }
];

/**
 * Get a category by its slug
 * @param slug - The category slug to look up
 * @returns The category object or undefined if not found
 */
export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find(category => category.slug === slug);
}

/**
 * Get a category by its name (case-insensitive)
 * @param name - The category name to look up
 * @returns The category object or undefined if not found
 */
export function getCategoryByName(name: string): Category | undefined {
  return CATEGORIES.find(
    category => category.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get all featured categories
 * @returns Array of featured categories
 */
export function getFeaturedCategories(): Category[] {
  return CATEGORIES.filter(category => category.featured);
}

/**
 * Get subcategories for a parent category
 * @param parentSlug - The parent category slug
 * @returns Array of subcategories
 */
export function getSubcategories(parentSlug: string): Category[] {
  return CATEGORIES.filter(category => category.parent === parentSlug);
}

/**
 * Find the best matching category for a given string
 * @param input - The input string to match against categories
 * @returns The best matching category or undefined if no good match
 */
export function findBestMatchingCategory(input: string): Category | undefined {
  if (!input) return undefined;
  
  const normalizedInput = input.toLowerCase();
  
  // First try exact match with name or slug
  const exactMatch = CATEGORIES.find(
    category => 
      category.name.toLowerCase() === normalizedInput ||
      category.slug === normalizedInput
  );
  
  if (exactMatch) return exactMatch;
  
  // Then try keyword matching
  for (const category of CATEGORIES) {
    if (category.keywords.some(keyword => normalizedInput.includes(keyword.toLowerCase()))) {
      return category;
    }
  }
  
  // Finally try partial name matching
  return CATEGORIES.find(
    category => normalizedInput.includes(category.name.toLowerCase())
  );
}

export default CATEGORIES;
