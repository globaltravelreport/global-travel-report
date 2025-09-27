import { Story } from '@/types/Story';

/**
 * Mock stories for development and testing
 */
export const mockStories: Story[] = [
  {
    id: '1',
    slug: 'exploring-paris',
    title: 'Exploring the Hidden Gems of Paris',
    excerpt: 'Discover the lesser-known attractions of the City of Light that most tourists never see.',
    content: 'Paris is more than just the Eiffel Tower and Louvre Museum. Beyond the crowded tourist attractions lies a city full of hidden gems waiting to be discovered. From secret gardens tucked away in historic neighborhoods to underground art galleries showcasing local talent, Paris offers endless opportunities for authentic experiences. Join us as we explore the lesser-known side of the City of Light, where locals gather and true Parisian culture thrives away from the spotlight.',
    author: 'John Doe',
    category: 'destinations',
    country: 'France',
    tags: ['Paris', 'Travel', 'Culture', 'Hidden Gems'],
    featured: true,
    editorsPick: true,
    publishedAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&q=80&w=2400',
    photographer: {
      name: 'Paris Photographer',
      url: 'https://unsplash.com/@paris'
    },
    metaTitle: 'Hidden Gems of Paris - Secret Places Locals Love',
    metaDescription: 'Discover Paris beyond the Eiffel Tower. Explore secret gardens, underground galleries, and authentic local neighborhoods in the City of Light.'
  },
  {
    id: '2',
    slug: 'best-hotels-paris',
    title: 'Best Hotels in Paris',
    excerpt: 'Discover the best hotels in Paris, from historic palaces to trendy boutiques.',
    content: 'Paris offers an incredible array of accommodation options, from historic palace hotels that have hosted royalty and celebrities to modern boutique properties that capture the city\'s contemporary vibe. Whether you\'re seeking the timeless elegance of a Left Bank institution or the cutting-edge design of a Marais newcomer, the French capital delivers exceptional hospitality at every price point. Our comprehensive guide covers everything from five-star luxury to charming boutique hotels, ensuring you find the perfect base for your Parisian adventure.',
    author: 'Travel Expert',
    category: 'hotels',
    country: 'France',
    tags: ['Paris', 'Hotels', 'Luxury', 'Boutique'],
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
    content: 'When it comes to business class travel, not all airlines are created equal. The world\'s leading carriers compete fiercely to offer the most luxurious and efficient flying experience for discerning travelers. From lie-flat seats that transform into comfortable beds to chef-designed meals served on fine china, business class has evolved into a premium travel category of its own. Our comprehensive analysis covers the top performers in international business class, evaluating everything from seat design and in-flight entertainment to ground services and route networks.',
    author: 'Aviation Expert',
    category: 'airlines',
    country: 'Global',
    tags: ['Airlines', 'Business Class', 'Luxury Travel', 'Aviation'],
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
    content: 'Africa\'s safari lodges represent the pinnacle of wildlife tourism, combining luxury accommodation with unparalleled access to nature\'s most spectacular show. From the vast plains of the Serengeti to the lush waterways of the Okavango Delta, these exclusive retreats offer front-row seats to the greatest wildlife spectacle on Earth. Our guide explores the continent\'s most exceptional safari lodges, from intimate tented camps that put you at eye level with elephants to opulent lodges with private plunge pools overlooking lion territories.',
    author: 'Safari Expert',
    category: 'adventure',
    country: 'Africa',
    tags: ['Safari', 'Africa', 'Wildlife', 'Luxury', 'Nature'],
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
    content: 'There\'s something inherently romantic about train travel, and when you elevate it to first-class standards, it becomes an unforgettable journey through both landscapes and luxury. From the legendary Venice Simplon-Orient-Express that recreates the golden age of rail travel to Japan\'s Shinkansen bullet trains that whisk you across the country in unparalleled comfort, first-class train journeys offer a unique blend of nostalgia, adventure, and sophistication. Our comprehensive guide explores the world\'s most extraordinary rail experiences.',
    author: 'Rail Expert',
    category: 'adventure',
    country: 'Europe',
    tags: ['Train', 'Luxury', 'Europe', 'Rail Travel'],
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
    content: 'The Maldives represents the ultimate tropical paradise, where luxury resorts are built on their own private islands, offering unparalleled exclusivity and natural beauty. These overwater villas and beachfront retreats provide the perfect blend of Robinson Crusoe adventure and five-star luxury. From underwater restaurants where you can dine while watching marine life swim by to private infinity pools that seem to merge with the Indian Ocean, Maldives resorts redefine the concept of tropical luxury. Our detailed guide covers the archipelago\'s most exceptional properties.',
    author: 'Island Expert',
    category: 'hotels',
    country: 'Maldives',
    tags: ['Maldives', 'Resort', 'Luxury', 'Beach', 'Tropical'],
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
