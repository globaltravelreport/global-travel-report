export interface Photographer {
  name: string;
  url: string;
}

export interface Story {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  country: string;
  tags: string[];
  featured: boolean;
  editorsPick: boolean;
  timestamp: string;
  imageUrl?: string;
  photographer?: Photographer;
} 