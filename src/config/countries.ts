
/**
 * Standardized country system for Global Travel Report
 * 
 * This file defines the official countries used throughout the site,
 * including their display names, slugs, and descriptions.
 */

export interface Country {
  name: string;        // Display name (e.g., "United States")
  slug: string;        // URL slug (e.g., "united-states")
  description: string; // Short description for country pages
  continent: string;   // Continent name
  featured: boolean;   // Whether to feature in homepage/navigation
}

/**
 * Main countries used throughout the site
 */
export const COUNTRIES: Country[] = [
  {
    name: 'Japan',
    slug: 'japan',
    description: 'Discover the land of the rising sun with its unique culture, technology, and natural beauty.',
    continent: 'Asia',
    featured: true
  },
  {
    name: 'Tanzania',
    slug: 'tanzania',
    description: 'Experience incredible wildlife safaris and the majestic Mount Kilimanjaro.',
    continent: 'Africa',
    featured: true
  },
  {
    name: 'Italy',
    slug: 'italy',
    description: 'Explore ancient history, world-class cuisine, and stunning Mediterranean coastlines.',
    continent: 'Europe',
    featured: true
  },
  {
    name: 'France',
    slug: 'france',
    description: 'From the romantic streets of Paris to the lavender fields of Provence.',
    continent: 'Europe',
    featured: true
  },
  {
    name: 'Thailand',
    slug: 'thailand',
    description: 'Tropical beaches, ancient temples, and vibrant street food culture.',
    continent: 'Asia',
    featured: true
  },
  {
    name: 'Australia',
    slug: 'australia',
    description: 'Unique wildlife, stunning landscapes, and vibrant cities down under.',
    continent: 'Oceania',
    featured: true
  },
  {
    name: 'United States',
    slug: 'united-states',
    description: 'From coast to coast, discover diverse landscapes and iconic destinations.',
    continent: 'North America',
    featured: true
  },
  {
    name: 'Brazil',
    slug: 'brazil',
    description: 'Amazon rainforest, beautiful beaches, and vibrant carnival culture.',
    continent: 'South America',
    featured: true
  },
  {
    name: 'South Africa',
    slug: 'south-africa',
    description: 'Wildlife safaris, wine regions, and diverse cultural experiences.',
    continent: 'Africa',
    featured: true
  },
  {
    name: 'Maldives',
    slug: 'maldives',
    description: 'Paradise islands with crystal-clear waters and luxury resorts.',
    continent: 'Asia',
    featured: true
  },
  {
    name: 'Global',
    slug: 'global',
    description: 'Stories and experiences from around the world.',
    continent: 'Global',
    featured: false
  },
  {
    name: 'Europe',
    slug: 'europe',
    description: 'Diverse cultures, rich history, and stunning architecture across the continent.',
    continent: 'Europe',
    featured: false
  },
  {
    name: 'Africa',
    slug: 'africa',
    description: 'Wildlife adventures and cultural experiences across the continent.',
    continent: 'Africa',
    featured: false
  }
];

/**
 * Get a country by its slug
 * @param slug - The country slug to look up
 * @returns The country object or undefined if not found
 */
export function getCountryBySlug(slug: string): Country | undefined {
  return COUNTRIES.find(country => country.slug === slug);
}

/**
 * Get a country by its name (case-insensitive)
 * @param name - The country name to look up
 * @returns The country object or undefined if not found
 */
export function getCountryByName(name: string): Country | undefined {
  return COUNTRIES.find(
    country => country.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get all featured countries
 * @returns Array of featured countries
 */
export function getFeaturedCountries(): Country[] {
  return COUNTRIES.filter(country => country.featured);
}

/**
 * Get countries by continent
 * @param continent - The continent name
 * @returns Array of countries in the specified continent
 */
export function getCountriesByContinent(continent: string): Country[] {
  return COUNTRIES.filter(country => country.continent === continent);
}

export default COUNTRIES;
