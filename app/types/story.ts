export interface Story {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  location: string;
  imageUrl: string;
  publishedAt: string;
  coverImage?: {
    url: string;
    alt?: string;
  };
} 