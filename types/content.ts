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

export interface StoryDraft extends Omit<Story, 'id' | 'slug' | 'createdAt' | 'updatedAt'> {
  isReadyToPublish: boolean;
}

export interface ImageSearchResult {
  id: string;
  url: string;
  alt: string;
  source: string;
  photographer?: string;
} 