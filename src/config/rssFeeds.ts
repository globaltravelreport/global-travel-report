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
  // Cruise and Travel Industry News
  {
    url: 'https://www.cruiseindustrynews.com/cruise-news/rss.xml',
    category: 'Cruises',
    priority: 1,
    updateFrequencyMinutes: 30,
    fallbackUrls: ['https://www.cruisecritic.com/rss/news.xml']
  },
  {
    url: 'https://www.cruisecritic.com/rss/news.xml',
    category: 'Cruises',
    priority: 2,
    updateFrequencyMinutes: 45,
    fallbackUrls: ['https://www.cruiseindustrynews.com/cruise-news/rss.xml']
  },

  // Major Travel Publications
  {
    url: 'https://www.lonelyplanet.com/news/rss.xml',
    category: 'Destinations',
    priority: 1,
    updateFrequencyMinutes: 60,
    fallbackUrls: ['https://www.travelandleisure.com/rss.xml']
  },
  {
    url: 'https://www.travelandleisure.com/rss.xml',
    category: 'Destinations',
    priority: 2,
    updateFrequencyMinutes: 60,
    fallbackUrls: ['https://www.lonelyplanet.com/news/rss.xml']
  },
  {
    url: 'https://www.cntraveler.com/rss.xml',
    category: 'Destinations',
    priority: 1,
    updateFrequencyMinutes: 60,
    fallbackUrls: ['https://www.travelandleisure.com/rss.xml']
  },

  // Hotel and Accommodation News
  {
    url: 'https://www.hotelnewsnow.com/Articles-RSS',
    category: 'Hotels',
    priority: 2,
    updateFrequencyMinutes: 90,
    fallbackUrls: ['https://www.travelweekly.com/rss']
  },

  // Aviation and Flight News
  {
    url: 'https://www.aviationweek.com/rss',
    category: 'Flights',
    priority: 3,
    updateFrequencyMinutes: 120,
    fallbackUrls: ['https://www.flightglobal.com/rss']
  },

  // Additional trusted travel sources
  {
    url: 'https://www.travelweekly.com/rss',
    category: 'Destinations',
    priority: 3,
    updateFrequencyMinutes: 90,
    fallbackUrls: ['https://www.travelpulse.com/rss']
  },
  {
    url: 'https://www.travelpulse.com/rss',
    category: 'Destinations',
    priority: 4,
    updateFrequencyMinutes: 90,
    fallbackUrls: ['https://www.travelweekly.com/rss']
  }
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
