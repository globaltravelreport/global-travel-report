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
  publishedAt: Date;
  imageUrl: string;
  photographer?: {
    name: string;
    url: string;
  };
  archived?: boolean;
}

export function isStoryArchived(story: Story): boolean {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return story.publishedAt < sevenDaysAgo;
}

export function getHomepageStories(stories: Story[]): Story[] {
  return stories
    .filter(story => !isStoryArchived(story))
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, 8);
}

export function getArchivedStories(stories: Story[]): Story[] {
  return stories
    .filter(story => isStoryArchived(story))
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

export function getStoriesByCountry(stories: Story[], country: string): Story[] {
  return stories
    .filter(story => story.country.toLowerCase() === country.toLowerCase())
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

export function getStoriesByCategory(stories: Story[], category: string): Story[] {
  return stories
    .filter(story => story.category.toLowerCase() === category.toLowerCase())
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
} 