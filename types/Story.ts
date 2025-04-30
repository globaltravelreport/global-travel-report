/**
 * Unified Story interface for the Global Travel Report
 */
export interface Story {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: Date | string;
  updatedAt?: string;
  author: string;
  category: string;
  country: string;
  tags: string[];
  featured: boolean;
  editorsPick: boolean;
  imageUrl?: string;
  image?: string; // Alias for imageUrl for compatibility
  type?: string; // Type of story (can be used interchangeably with category)
  date?: Date | string; // Alias for publishedAt for compatibility
  keywords?: string[]; // Alias for tags for compatibility

  // Optional fields
  archived?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  holidayType?: string;
  readingTime?: number;

  // Nested objects
  photographer?: {
    name: string;
    url?: string;
  };
  coverImage?: {
    url: string;
    alt: string;
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };

  // Structured data fields
  attractions?: Array<{
    name: string;
    description: string;
    image?: string;
    url?: string;
  }>;

  faqs?: Array<{
    question: string;
    answer: string;
  }>;

  event?: {
    name: string;
    description: string;
    startDate: string | Date;
    endDate: string | Date;
    location: string;
    image?: string;
    url?: string;
    organizer?: string;
    price?: string;
    currency?: string;
  };

  reviews?: Array<{
    name: string;
    reviewBody: string;
    author: string;
    datePublished: string | Date;
    ratingValue: number;
    bestRating?: number;
    worstRating?: number;
    itemReviewed: {
      name: string;
      description?: string;
      image?: string;
      url?: string;
      type: 'Hotel' | 'Restaurant' | 'Attraction' | 'Product' | 'LocalBusiness';
    };
  }>;

  // We use image as an alias for imageUrl for compatibility
}

/**
 * Type for story validation results
 */
export interface StoryValidationResult {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
}

/**
 * Type for story processing statistics
 */
export interface StoryProcessingStats {
  storiesProcessed: number;
  lastProcessedTime: Date | null;
}