export type Category = 'news' | 'reviews' | 'tips' | 'deals' | 'destinations';

export interface Story {
  id: string;
  title: string;
  content: string;
  summary?: string;
  category: Category;
  slug: string;
  status: 'draft' | 'pending' | 'published';
  featuredImage: {
    url: string;
    alt: string;
    source?: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  author: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface StoryDraft {
  id?: string;
  title: string;
  content: string;
  category: Category;
  status?: 'draft' | 'published';
  author?: string;
  isReadyToPublish?: boolean;
  summary: string;
  image?: string;
  featuredImage?: {
    url: string;
    alt: string;
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  date?: string;
  createdAt?: string;
  publishedAt?: string;
  slug: string;
}

export interface ImageSearchResult {
  id: string;
  url: string;
  alt: string;
  source: string;
  photographer?: string;
}

export interface RewrittenContent {
  title: string;
  summary: string;
  content: string;
  keywords: string[];
  callToAction?: string;
} 