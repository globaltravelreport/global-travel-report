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

export async function getStories() {
  return [
    {
      title: "Best Hotels in Paris",
      slug: "best-hotels-paris",
      metaTitle: "Luxury and Boutique Hotels in Paris",
      metaDescription: "Explore top luxury and boutique hotels in the City of Light.",
      excerpt: "Discover the best hotels in Paris, from historic palaces to trendy boutiques.",
      country: "France",
      holidayType: "Hotel",
      imageUrl: "https://source.unsplash.com/800x600/?paris,hotel",
    },
    {
      title: "Top Airlines for Business Class",
      slug: "top-airlines-business-class",
      metaTitle: "Top Business Class Airlines Compared",
      metaDescription: "A detailed comparison of the best business class airlines worldwide.",
      excerpt: "Fly in style with the finest business class airlines offering superior service and comfort.",
      country: "Global",
      holidayType: "Air",
      imageUrl: "https://source.unsplash.com/800x600/?airplane,businessclass",
    },
    {
      title: "Safari Lodges in Africa",
      slug: "safari-lodges-africa",
      metaTitle: "Best Safari Lodges for Adventure",
      metaDescription: "Experience the wild with Africa's top luxury safari lodges.",
      excerpt: "Stay at the world's best safari lodges in Africa and witness stunning wildlife.",
      country: "Africa",
      holidayType: "Tours",
      imageUrl: "https://source.unsplash.com/800x600/?safari,africa",
    },
    {
      title: "First Class Train Journeys",
      slug: "first-class-train-journeys",
      metaTitle: "World's Most Luxurious Train Journeys",
      metaDescription: "Travel in ultimate comfort aboard first-class train routes.",
      excerpt: "Experience elegance on rails with these luxury first-class train journeys.",
      country: "Europe",
      holidayType: "Tours",
      imageUrl: "https://source.unsplash.com/800x600/?train,firstclass",
    },
    {
      title: "Luxury Resorts in the Maldives",
      slug: "luxury-resorts-maldives",
      metaTitle: "Best Maldives Resorts",
      metaDescription: "Your guide to the most luxurious resorts in the Maldives.",
      excerpt: "Swim with dolphins, dine underwater, and relax in stunning overwater villas.",
      country: "Maldives",
      holidayType: "Hotel",
      imageUrl: "https://source.unsplash.com/800x600/?maldives,resort",
    },
    {
      title: "Best Travel Credit Cards",
      slug: "best-travel-credit-cards",
      metaTitle: "Top Credit Cards for Frequent Travelers",
      metaDescription: "Maximize rewards and perks with the best travel credit cards.",
      excerpt: "Earn points faster and enjoy luxury travel perks with these top cards.",
      country: "Global",
      holidayType: "Finance",
      imageUrl: "https://source.unsplash.com/800x600/?travel,creditcard",
    },
  ];
} 