export interface Story {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: Date;
  imageUrl?: string;
  photographer?: {
    name: string;
    url?: string;
  };
  tags: string[];
  category: string;
  country: string;
  featured: boolean;
  editorsPick: boolean;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

export async function getStories(): Promise<Story[]> {
  // TODO: Implement actual data fetching
  return [];
} 