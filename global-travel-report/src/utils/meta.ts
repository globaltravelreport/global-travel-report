import type { Story } from '@/types/Story';
import { getCategoryBySlug, findBestMatchingCategory } from '@/src/config/categories';

/**
 * Generate an optimized meta description for a story
 * 
 * @param story - The story to generate a meta description for
 * @param maxLength - Maximum length of the description (default: 160)
 * @returns Optimized meta description
 */
export function generateStoryMetaDescription(story: Story, maxLength: number = 160): string {
  // Start with the story excerpt if available
  let description = story.excerpt || '';
  
  // If the description is empty or too short, generate one from story data
  if (!description || description.length < 50) {
    const categoryInfo = story.category 
      ? getCategoryBySlug(story.category.toLowerCase().replace(/\s+/g, '-')) || findBestMatchingCategory(story.category)
      : null;
      
    const categoryName = categoryInfo?.name || story.category || '';
    const countryName = story.country || '';
    
    // Generate a description based on available data
    if (categoryName && countryName) {
      description = `Explore ${categoryName.toLowerCase()} travel insights about ${countryName}. Read the latest travel news, tips, and destination guides from Global Travel Report.`;
    } else if (categoryName) {
      description = `Discover the latest ${categoryName.toLowerCase()} travel insights and news from Global Travel Report. Expert travel guides and tips for travelers.`;
    } else if (countryName) {
      description = `Travel insights about ${countryName} from Global Travel Report. Discover destinations, tips, and the latest travel news.`;
    } else {
      description = `Read the latest travel news, insights, and destination guides from Global Travel Report. Expert travel tips and inspiration for your next adventure.`;
    }
  }
  
  // Ensure the description isn't too long
  if (description.length > maxLength) {
    // Truncate at the last complete sentence that fits within maxLength
    const truncated = description.substring(0, maxLength);
    const lastPeriod = truncated.lastIndexOf('.');
    const lastQuestion = truncated.lastIndexOf('?');
    const lastExclamation = truncated.lastIndexOf('!');
    
    // Find the last sentence end
    const lastSentenceEnd = Math.max(lastPeriod, lastQuestion, lastExclamation);
    
    if (lastSentenceEnd > maxLength * 0.5) {
      // If we found a sentence end that's at least halfway through, use it
      description = description.substring(0, lastSentenceEnd + 1);
    } else {
      // Otherwise truncate at the last complete word
      const lastSpace = truncated.lastIndexOf(' ');
      description = description.substring(0, lastSpace) + '...';
    }
  }
  
  return description;
}

/**
 * Generate an optimized meta title for a story
 * 
 * @param story - The story to generate a meta title for
 * @param siteName - The name of the site (default: 'Global Travel Report')
 * @param maxLength - Maximum length of the title (default: 60)
 * @returns Optimized meta title
 */
export function generateStoryMetaTitle(story: Story, siteName: string = 'Global Travel Report', maxLength: number = 60): string {
  // Remove any "Title: " prefix that might be in the story title
  let title = story.title.replace(/^Title:\s*/i, '');
  
  // Calculate the available space for the title
  const separator = ' - ';
  const availableSpace = maxLength - siteName.length - separator.length;
  
  // If the title is too long, truncate it
  if (title.length > availableSpace) {
    // Truncate at the last complete word
    title = title.substring(0, availableSpace);
    const lastSpace = title.lastIndexOf(' ');
    if (lastSpace > availableSpace * 0.7) {
      title = title.substring(0, lastSpace);
    }
  }
  
  return `${title}${separator}${siteName}`;
}

/**
 * Generate optimized meta tags for a story
 * 
 * @param story - The story to generate meta tags for
 * @param siteName - The name of the site (default: 'Global Travel Report')
 * @returns Object with title and description
 */
export function generateStoryMeta(story: Story, siteName: string = 'Global Travel Report'): { title: string; description: string } {
  return {
    title: generateStoryMetaTitle(story, siteName),
    description: generateStoryMetaDescription(story),
  };
}
