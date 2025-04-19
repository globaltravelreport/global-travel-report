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
  category: Category;
  status: 'draft' | 'pending' | 'published';
  author: string;
  isReadyToPublish: boolean;
  publishedAt?: string;
  featuredImage: FeaturedImage;
  seo: SEOMetadata;
}

export interface RewrittenContent {
  title: string;
  summary: string;
  content: string;
  keywords: string[];
} 