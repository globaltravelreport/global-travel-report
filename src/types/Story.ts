/**
 * Story type definition for Global Travel Report
 *
 * Represents a travel story/article with all its metadata and content
 */

export interface Story {
  id?: string;
  title: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  excerpt?: string;
  category: string;
  country: string;
  body?: string;
  content?: string;
  featured?: boolean;
  published?: boolean;
  timestamp: string;
  publishedAt?: string;
  imageName?: string;
  imageUrl?: string;
  author?: string;
  readTime?: number;
  tags?: string[];
  isSponsored?: boolean;
  editorsPick?: boolean;
  rewritten?: boolean;
  processedAt?: string;
}