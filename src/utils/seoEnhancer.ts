/**
 * SEO Enhancer
 * 
 * A utility for enhancing story metadata for better SEO performance.
 * This includes generating optimized tags, slugs, and meta descriptions.
 */

import { Story } from '@/types/Story';
import { slugify } from './url';

// Popular travel-related keywords for better SEO
const POPULAR_TRAVEL_KEYWORDS = [
  'travel guide', 'best places', 'hidden gems', 'travel tips', 'must visit',
  'budget travel', 'luxury travel', 'adventure travel', 'family vacation',
  'travel itinerary', 'local cuisine', 'cultural experience', 'scenic views',
  'tourist attractions', 'off the beaten path', 'travel photography',
  'travel inspiration', 'bucket list', 'weekend getaway', 'road trip',
  'backpacking', 'solo travel', 'eco tourism', 'sustainable travel',
  'all-inclusive', 'travel deals', 'travel hacks', 'travel planning'
];

// Country-specific keywords to enhance location relevance
const COUNTRY_KEYWORDS: Record<string, string[]> = {
  'Australia': ['aussie', 'down under', 'outback', 'great barrier reef', 'sydney', 'melbourne'],
  'USA': ['america', 'united states', 'national parks', 'new york', 'california', 'florida'],
  'UK': ['britain', 'england', 'london', 'scotland', 'wales', 'british'],
  'France': ['paris', 'french riviera', 'provence', 'normandy', 'loire valley'],
  'Italy': ['rome', 'venice', 'florence', 'tuscany', 'amalfi coast', 'sicily'],
  'Japan': ['tokyo', 'kyoto', 'osaka', 'mount fuji', 'japanese culture'],
  'Thailand': ['bangkok', 'phuket', 'chiang mai', 'thai islands', 'thai food'],
  'Global': ['international', 'worldwide', 'global destinations', 'world travel']
};

// Category-specific keywords
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Travel': ['destinations', 'places to visit', 'travel guide', 'vacation spots'],
  'Cruise': ['cruise ships', 'cruise lines', 'cruise destinations', 'cruise deals', 'cruise tips'],
  'Adventure': ['outdoor activities', 'adventure sports', 'hiking', 'trekking', 'extreme sports'],
  'Luxury': ['luxury hotels', 'luxury resorts', 'luxury travel', 'exclusive destinations'],
  'Budget': ['affordable travel', 'budget destinations', 'cheap flights', 'backpacking'],
  'Family': ['family-friendly', 'kid-friendly', 'family destinations', 'family activities'],
  'Food': ['food tourism', 'culinary travel', 'food destinations', 'local cuisine', 'food guide'],
  'Culture': ['cultural tourism', 'historical sites', 'museums', 'local traditions', 'festivals']
};

/**
 * Generate optimized tags for a story based on its content
 * @param story The story to generate tags for
 * @returns An array of optimized tags
 */
export function generateOptimizedTags(story: Story): string[] {
  const existingTags = story.tags || [];
  const suggestedTags: string[] = [];
  
  // Add country-specific keywords
  const countryKeywords = COUNTRY_KEYWORDS[story.country] || COUNTRY_KEYWORDS['Global'];
  suggestedTags.push(...countryKeywords);
  
  // Add category-specific keywords
  const mainCategory = story.category.split(',')[0].trim();
  const categoryKeywords = CATEGORY_KEYWORDS[mainCategory] || CATEGORY_KEYWORDS['Travel'];
  suggestedTags.push(...categoryKeywords);
  
  // Add popular travel keywords
  suggestedTags.push(...POPULAR_TRAVEL_KEYWORDS);
  
  // Extract potential keywords from title and content
  const titleWords = story.title.split(' ')
    .filter(word => word.length > 5)
    .map(word => word.toLowerCase());
  
  suggestedTags.push(...titleWords);
  
  // Combine existing and suggested tags, remove duplicates, and limit to 15 tags
  const allTags = [...existingTags, ...suggestedTags];
  const uniqueTags = Array.from(new Set(allTags.map(tag => tag.toLowerCase())))
    .map(tag => tag.charAt(0).toUpperCase() + tag.slice(1)); // Capitalize first letter
  
  return uniqueTags.slice(0, 15);
}

/**
 * Generate an SEO-optimized slug for a story
 * @param story The story to generate a slug for
 * @returns An optimized slug
 */
export function generateOptimizedSlug(story: Story): string {
  // Start with the title
  let baseSlug = story.title;
  
  // Add country if it's not already in the title
  if (story.country && story.country !== 'Global' && !story.title.includes(story.country)) {
    baseSlug = `${baseSlug} ${story.country}`;
  }
  
  // Add main category if it's not already in the title
  const mainCategory = story.category.split(',')[0].trim();
  if (mainCategory && !story.title.toLowerCase().includes(mainCategory.toLowerCase())) {
    baseSlug = `${baseSlug} ${mainCategory}`;
  }
  
  // Generate the slug
  const optimizedSlug = slugify(baseSlug);
  
  // Ensure the slug is not too long (max 60 characters)
  return optimizedSlug.length > 60 ? optimizedSlug.substring(0, 60) : optimizedSlug;
}

/**
 * Generate an SEO-optimized meta description
 * @param story The story to generate a description for
 * @returns An optimized meta description
 */
export function generateOptimizedDescription(story: Story): string {
  // Start with the excerpt if available
  let description = story.excerpt || '';
  
  // If no excerpt, use the first 150 characters of the content
  if (!description && story.content) {
    description = story.content.substring(0, 150).trim();
    
    // Ensure it doesn't cut off in the middle of a word
    const lastSpaceIndex = description.lastIndexOf(' ');
    if (lastSpaceIndex > 0) {
      description = description.substring(0, lastSpaceIndex);
    }
    
    description += '...';
  }
  
  // If still no description, create one from the title
  if (!description) {
    description = `Discover everything about ${story.title}. Read our comprehensive guide on ${story.title} at Global Travel Report.`;
  }
  
  // Add country and category if not already mentioned
  if (story.country && story.country !== 'Global' && !description.includes(story.country)) {
    description = `${description} Explore ${story.country} with our expert travel insights.`;
  }
  
  // Ensure the description is not too long (max 160 characters)
  if (description.length > 160) {
    description = description.substring(0, 157) + '...';
  }
  
  return description;
}

/**
 * Generate image alt text optimized for SEO
 * @param story The story the image belongs to
 * @returns Optimized alt text for the image
 */
export function generateOptimizedImageAlt(story: Story): string {
  // Start with the title
  let altText = story.title;
  
  // Add country if it's not already in the title
  if (story.country && story.country !== 'Global' && !altText.includes(story.country)) {
    altText = `${altText} - ${story.country}`;
  }
  
  // Add photographer credit
  if (story.photographer && story.photographer.name) {
    altText = `${altText} | Photo by ${story.photographer.name}`;
  }
  
  // Ensure the alt text is not too long (max 125 characters)
  if (altText.length > 125) {
    altText = altText.substring(0, 125);
  }
  
  return altText;
}

/**
 * Fully enhance a story with SEO optimizations
 * @param story The story to enhance
 * @returns An SEO-enhanced story
 */
export function enhanceStoryForSEO(story: Story): Story {
  // Generate optimized tags if none exist or there are fewer than 5
  const tags = (!story.tags || story.tags.length < 5) 
    ? generateOptimizedTags(story) 
    : story.tags;
  
  // Generate optimized slug if none exists
  const slug = !story.slug ? generateOptimizedSlug(story) : story.slug;
  
  // Generate optimized excerpt if none exists
  const excerpt = !story.excerpt ? generateOptimizedDescription(story) : story.excerpt;
  
  // Return the enhanced story
  return {
    ...story,
    tags,
    slug,
    excerpt
  };
}

export default {
  generateOptimizedTags,
  generateOptimizedSlug,
  generateOptimizedDescription,
  generateOptimizedImageAlt,
  enhanceStoryForSEO
};
