export interface Story {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  category: string;
  country: string;
  body: string;
  featured: boolean;
  published: boolean;
  timestamp: string;
  imageUrl?: string;
  imageName?: string;
  author: string;
  readTime: number;
  tags: string[];
  isSponsored: boolean;
  editorsPick: boolean;
} 