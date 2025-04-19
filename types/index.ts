export interface FeaturedItem {
  id: string | number;
  title: string;
  summary: string;
  image: string;
  slug: string;
  category: string;
  date: string;
  photographer?: {
    name: string;
    username: string;
    url: string;
  };
} 