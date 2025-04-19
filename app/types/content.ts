export type Category = 'news' | 'reviews' | 'tips' | 'deals' | 'destinations';

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
}

export interface FeaturedImage {
  url: string;
  alt: string;
}

export interface StoryDraft {
  title: string;
  content: string;
  summary?: string;
  category: string;
  status: 'draft' | 'published';
  featuredImage?: string;
  seo?: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export interface RewrittenContent {
  title: string;
  summary: string;
  content: string;
  keywords: string[];
}

export interface FeaturedItem {
  id: string;
  title: string;
  summary: string;
  image: string;
  category: string;
  date: string;
  slug: string;
  photographer?: {
    name: string;
    username: string;
    url?: string;
  };
} 