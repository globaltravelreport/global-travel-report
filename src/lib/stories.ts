import { format } from 'date-fns';

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

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMMM dd, yyyy');
};

export async function getStories(): Promise<Story[]> {
  return [
    {
      id: "1",
      title: "Best Hotels in Paris",
      slug: "best-hotels-paris",
      excerpt: "Discover the best hotels in Paris, from historic palaces to trendy boutiques.",
      content: "Full content about the best hotels in Paris...",
      author: "Travel Expert",
      publishedAt: new Date(),
      imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      photographer: {
        name: "Unsplash Photographer",
        url: "https://unsplash.com"
      },
      tags: ["hotels", "paris", "luxury"],
      category: "Hotels",
      country: "France",
      featured: true,
      editorsPick: true
    },
    {
      id: "2",
      title: "Top Airlines for Business Class",
      slug: "top-airlines-business-class",
      excerpt: "Fly in style with the finest business class airlines offering superior service and comfort.",
      content: "Full content about business class airlines...",
      author: "Travel Expert",
      publishedAt: new Date(),
      imageUrl: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80",
      photographer: {
        name: "Unsplash Photographer",
        url: "https://unsplash.com"
      },
      tags: ["airlines", "business-class", "travel"],
      category: "Airlines",
      country: "Global",
      featured: true,
      editorsPick: false
    },
    {
      id: "3",
      title: "Safari Lodges in Africa",
      slug: "safari-lodges-africa",
      excerpt: "Stay at the world's best safari lodges in Africa and witness stunning wildlife.",
      content: "Full content about safari lodges...",
      author: "Travel Expert",
      publishedAt: new Date(),
      imageUrl: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
      photographer: {
        name: "Unsplash Photographer",
        url: "https://unsplash.com"
      },
      tags: ["safari", "africa", "wildlife"],
      category: "Tours",
      country: "Africa",
      featured: true,
      editorsPick: true
    },
    {
      id: "4",
      title: "First Class Train Journeys",
      slug: "first-class-train-journeys",
      excerpt: "Experience elegance on rails with these luxury first-class train journeys.",
      content: "Full content about train journeys...",
      author: "Travel Expert",
      publishedAt: new Date(),
      imageUrl: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80",
      photographer: {
        name: "Unsplash Photographer",
        url: "https://unsplash.com"
      },
      tags: ["trains", "luxury", "travel"],
      category: "Tours",
      country: "Europe",
      featured: false,
      editorsPick: true
    },
    {
      id: "5",
      title: "Luxury Resorts in the Maldives",
      slug: "luxury-resorts-maldives",
      excerpt: "Swim with dolphins, dine underwater, and relax in stunning overwater villas.",
      content: "Full content about Maldives resorts...",
      author: "Travel Expert",
      publishedAt: new Date(),
      imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      photographer: {
        name: "Unsplash Photographer",
        url: "https://unsplash.com"
      },
      tags: ["resorts", "maldives", "luxury"],
      category: "Hotels",
      country: "Maldives",
      featured: true,
      editorsPick: true
    },
    {
      id: "6",
      title: "Best Travel Credit Cards",
      slug: "best-travel-credit-cards",
      excerpt: "Earn points faster and enjoy luxury travel perks with these top cards.",
      content: "Full content about travel credit cards...",
      author: "Travel Expert",
      publishedAt: new Date(),
      imageUrl: "https://source.unsplash.com/800x600/?travel,creditcard",
      photographer: {
        name: "Unsplash Photographer",
        url: "https://unsplash.com"
      },
      tags: ["credit-cards", "travel", "finance"],
      category: "Finance",
      country: "Global",
      featured: false,
      editorsPick: false
    }
  ];
}

export async function getStoriesByCategory(category: string): Promise<Story[]> {
  const stories = await getStories();
  return stories.filter(story => story.category.toLowerCase() === category.toLowerCase());
}

export async function getStoriesByCountry(country: string): Promise<Story[]> {
  const stories = await getStories();
  return stories.filter(story => story.country.toLowerCase() === country.toLowerCase());
} 