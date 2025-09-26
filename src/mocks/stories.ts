import { Story } from '@/types/Story';

/**
 * Mock stories for development and testing
 */
export const mockStories: Story[] = [
  {
    id: '1',
    slug: 'exploring-paris',
    title: 'Exploring the Hidden Gems of Paris',
    excerpt: 'Discover the lesser-known attractions of the City of Light.',
    content: 'Full article content here...',
    author: 'John Doe',
    category: 'Travel',
    country: 'France',
    tags: ['Paris', 'Travel', 'Culture'],
    featured: true,
    editorsPick: true,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&q=80&w=2400',
    photographer: {
      name: 'Paris Photographer',
      url: 'https://unsplash.com/@paris'
    }
  },
  {
    id: '2',
    slug: 'best-hotels-paris',
    title: 'Best Hotels in Paris',
    excerpt: 'Discover the best hotels in Paris, from historic palaces to trendy boutiques.',
    content: 'Detailed content about Paris hotels...',
    author: 'Travel Expert',
    category: 'Hotel',
    country: 'France',
    tags: ['Paris', 'Hotels', 'Luxury'],
    featured: true,
    editorsPick: false,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&q=80&w=2400',
    photographer: {
      name: 'Paris Photographer',
      url: 'https://unsplash.com/@parisphoto'
    },
    metaTitle: 'Luxury and Boutique Hotels in Paris',
    metaDescription: 'Explore top luxury and boutique hotels in the City of Light.',
    holidayType: 'Hotel'
  },
  {
    id: '3',
    slug: 'top-airlines-business-class',
    title: 'Top Airlines for Business Class',
    excerpt: 'Fly in style with the finest business class airlines offering superior service and comfort.',
    content: 'Detailed content about business class airlines...',
    author: 'Aviation Expert',
    category: 'Airlines',
    country: 'Global',
    tags: ['Airlines', 'Business Class', 'Luxury Travel'],
    featured: false,
    editorsPick: true,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1540339832862-474599807836?auto=format&q=80&w=2400',
    photographer: {
      name: 'Aviation Photographer',
      url: 'https://unsplash.com/@aviationphoto'
    },
    metaTitle: 'Top Business Class Airlines Compared',
    metaDescription: 'A detailed comparison of the best business class airlines worldwide.',
    holidayType: 'Air'
  },
  {
    id: '4',
    slug: 'safari-lodges-africa',
    title: 'Safari Lodges in Africa',
    excerpt: 'Stay at the world\'s best safari lodges in Africa and witness stunning wildlife.',
    content: 'Detailed content about African safari lodges...',
    author: 'Safari Expert',
    category: 'Tours',
    country: 'Africa',
    tags: ['Safari', 'Africa', 'Wildlife'],
    featured: true,
    editorsPick: true,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&q=80&w=2400',
    photographer: {
      name: 'Wildlife Photographer',
      url: 'https://unsplash.com/@wildlifephoto'
    },
    metaTitle: 'Best Safari Lodges for Adventure',
    metaDescription: 'Experience the wild with Africa\'s top luxury safari lodges.',
    holidayType: 'Tours'
  },
  {
    id: '5',
    slug: 'first-class-train-journeys',
    title: 'First Class Train Journeys',
    excerpt: 'Experience elegance on rails with these luxury first-class train journeys.',
    content: 'Detailed content about luxury train journeys...',
    author: 'Rail Expert',
    category: 'Tours',
    country: 'Europe',
    tags: ['Train', 'Luxury', 'Europe'],
    featured: false,
    editorsPick: false,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1553773077-91673524aafa?auto=format&q=80&w=2400',
    photographer: {
      name: 'Rail Photographer',
      url: 'https://unsplash.com/@railphoto'
    },
    metaTitle: 'World\'s Most Luxurious Train Journeys',
    metaDescription: 'Travel in ultimate comfort aboard first-class train routes.',
    holidayType: 'Tours'
  },
  {
    id: '6',
    slug: 'luxury-resorts-maldives',
    title: 'Luxury Resorts in the Maldives',
    excerpt: 'Swim with dolphins, dine underwater, and relax in stunning overwater villas.',
    content: 'Detailed content about Maldives resorts...',
    author: 'Island Expert',
    category: 'Hotel',
    country: 'Maldives',
    tags: ['Maldives', 'Resort', 'Luxury'],
    featured: true,
    editorsPick: false,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&q=80&w=2400',
    photographer: {
      name: 'Island Photographer',
      url: 'https://unsplash.com/@islandphoto'
    },
    metaTitle: 'Best Maldives Resorts',
    metaDescription: 'Your guide to the most luxurious resorts in the Maldives.',
    holidayType: 'Hotel'
  }
];

/**
 * Mock categories for development and testing
 */
export const mockCategories = [
  "adventure",
  "culture",
  "food",
  "nature",
  "urban",
  "hotels",
  "airlines",
  "cruises",
  "destinations"
];

/**
 * Mock countries for development and testing
 */
export const mockCountries = [
  "japan",
  "tanzania",
  "italy",
  "france",
  "thailand",
  "australia",
  "united-states",
  "brazil",
  "south-africa"
];

/**
 * Mock tags for development and testing
 */
export const mockTags = [
  "temples",
  "wildlife",
  "culinary",
  "history",
  "beaches",
  "mountains",
  "cities",
  "luxury",
  "budget"
];
