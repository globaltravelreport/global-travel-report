export interface Story {
  title: string;
  summary: string;
  content: string;
  slug: string;
  date: string;
  timestamp: number;
  lastModified: number;
  country: string;
  type: string;           // Primary category (Destination, Airline, Hotel, Experience)
  categories: string[];   // Additional categories (Luxury, Business, Budget, etc.)
  keywords: string[];     // SEO keywords
  tags: string[];        // Specific tags for detailed classification
  imageUrl?: string;
  imageAlt?: string;
  author?: string;
  source?: string;
  sourceUrl?: string;
  body?: string;
  published?: boolean;
  featured?: boolean;
  editorsPick?: boolean;
  readTime?: number;
  metaDescription?: string;
  isSponsored?: boolean;
  category?: string;     // Legacy field for backward compatibility during migration
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export type StoryDraft = Omit<Story, 'timestamp' | 'lastModified'>;

export type StoryType = 'Destination' | 'Airline' | 'Hotel' | 'Experience';

export const STORY_CATEGORIES = [
  'Luxury',
  'Business',
  'Budget',
  'Lounge',
  'First Class',
  'Business Class',
  'Economy',
  'Adventure',
  'Food & Dining',
  'Shopping',
  'Family',
  'Solo Travel',
  'Wellness',
  'Culture'
] as const;

export type StoryCategory = typeof STORY_CATEGORIES[number]; 