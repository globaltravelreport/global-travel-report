export interface Story {
  title: string;
  content: string;
  summary: string;
  slug: string;
  date: string;
  timestamp: number;
  lastModified: number;
  country: string;
  type: string;
  keywords: string[];
  imageUrl?: string;
  imageAlt?: string;
  author?: string;
  source?: string;
  sourceUrl?: string;
  tags?: string[];
  body?: string;
  published?: boolean;
  category?: string;
  featured?: boolean;
  editorsPick?: boolean;
  readTime?: number;
  metaDescription?: string;
  isSponsored?: boolean;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export interface StoryDraft extends Partial<Story> {
  title: string;
  content: string;
  category: string;
  status?: 'draft' | 'published';
  isReadyToPublish?: boolean;
}

export interface StoryFormData extends Partial<Story> {
  title: string;
  content: string;
  category: string;
  country: string;
  metaDescription: string;
} 