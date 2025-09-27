// RSS Feed Configuration for Content Pipeline
// Defines all travel and cruise news sources, category mappings, validation rules, deduplication, rate limiting, and filtering

export interface RSSFeedSource {
  url: string;
  category: string;
  priority: number;
  updateFrequencyMinutes: number;
  fallbackUrls?: string[];
}

export interface CategoryMapping {
  [externalCategory: string]: string; // e.g. 'Cruises' => 'Cruises', 'Travel' => 'Destinations'
}

export interface FeedValidationRule {
  minContentLength: number;
  requiredFields: string[];
  qualityThreshold: number;
}

export interface DeduplicationSettings {
  similarityThreshold: number;
  matchBy: ('title' | 'url' | 'content')[];
}

export interface RateLimitConfig {
  fetchIntervalMinutes: number;
  maxConcurrent: number;
}

export interface ContentFilterRule {
  keywords: string[];
  patterns: RegExp[];
  excludeIf: (story: any) => boolean;
}

export const rssFeedSources: RSSFeedSource[] = [
  {
    url: 'https://www.cruiseindustrynews.com/cruise-news/rss.xml',
    category: 'Cruises',
    priority: 1,
    updateFrequencyMinutes: 30,
    fallbackUrls: ['https://www.cruisecritic.com/rss/news.xml']
  },
  {
    url: 'https://www.lonelyplanet.com/news/rss.xml',
    category: 'Destinations',
    priority: 2,
    updateFrequencyMinutes: 60,
    fallbackUrls: ['https://www.travelandleisure.com/rss.xml']
  },
  // ...add more feeds as needed
];

export const categoryMappings: CategoryMapping = {
  'Cruise News': 'Cruises',
  'Travel': 'Destinations',
  'Hotels': 'Hotels',
  'Airlines': 'Flights',
  // ...add more mappings
};

export const feedValidationRules: Record<string, FeedValidationRule> = {
  Cruises: {
    minContentLength: 300,
    requiredFields: ['title', 'link', 'content'],
    qualityThreshold: 0.7
  },
  Destinations: {
    minContentLength: 250,
    requiredFields: ['title', 'link', 'content'],
    qualityThreshold: 0.6
  },
  // ...add more rules
};

export const deduplicationSettings: DeduplicationSettings = {
  similarityThreshold: 0.85,
  matchBy: ['title', 'url']
};

export const rateLimitConfig: RateLimitConfig = {
  fetchIntervalMinutes: 10,
  maxConcurrent: 3
};

export const fallbackFeeds: Record<string, string[]> = {
  Cruises: ['https://www.cruisecritic.com/rss/news.xml'],
  Destinations: ['https://www.travelandleisure.com/rss.xml']
};

export const contentFilterRules: ContentFilterRule[] = [
  {
    keywords: ['casino', 'gambling', 'adult'],
    patterns: [/\bcasino\b/i, /\badult\b/i],
    excludeIf: (story) => false // Add custom logic as needed
  }
];
