import Image from 'next/image';

export const metadata = {
  title: 'Categories - Global Travel Report',
  description: 'Explore travel stories by category. Find articles about cruises, airlines, hotels, destinations, food & dining, adventure, culture, and more.',
};

// Define the categories data
const CATEGORIES = [
  {
    name: 'Cruises',
    slug: 'cruises',
    iconPath: '/images/categories/cruises.svg',
    description: 'Ocean and river cruise experiences, reviews, and news',
    featured: true,
  },
  {
    name: 'Airlines',
    slug: 'airlines',
    iconPath: '/images/categories/airlines.svg',
    description: 'Airline reviews, news, and flight experiences',
    featured: true,
  },
  {
    name: 'Destinations',
    slug: 'destinations',
    iconPath: '/images/categories/destinations.svg',
    description: 'Guides and stories about travel destinations worldwide',
    featured: true,
  },
  {
    name: 'Travel Tips',
    slug: 'travel-tips',
    iconPath: '/images/categories/travel-tips.svg',
    description: 'Practical advice and tips for travelers',
    featured: true,
  },
  {
    name: 'Food & Dining',
    slug: 'food-dining',
    iconPath: '/images/categories/food-dining.svg',
    description: 'Culinary experiences and food-focused travel',
    featured: true,
  },
  {
    name: 'Culture',
    slug: 'culture',
    iconPath: '/images/categories/culture.svg',
    description: 'Cultural experiences, history, and heritage travel',
    featured: true,
  },
  {
    name: 'Nature',
    slug: 'nature',
    iconPath: '/images/categories/nature.svg',
    description: 'Nature-focused travel and outdoor experiences',
    featured: true,
  },
  {
    name: 'Luxury Travel',
    slug: 'luxury-travel',
    iconPath: '/images/categories/luxury-travel.svg',
    description: 'Premium travel experiences and luxury destinations',
    featured: true,
  },
  {
    name: 'Family Travel',
    slug: 'family-travel',
    iconPath: '/images/categories/family-travel.svg',
    description: 'Travel ideas and tips for families with children',
    featured: true,
  },
  {
    name: 'Adventure',
    slug: 'adventure',
    iconPath: '/images/categories/adventure.svg',
    description: 'Thrilling experiences and adventure travel',
    featured: false,
  },
  {
    name: 'Deals',
    slug: 'deals',
    iconPath: '/images/categories/deals.svg',
    description: 'The best travel deals and discounts',
    featured: false,
  },
];

export default function CategoriesPage() {
  // Get all main categories
  const mainCategories = CATEGORIES;

  // Group categories by featured status
  const featuredCategories = mainCategories.filter(category => category.featured);
  const otherCategories = mainCategories.filter(category => !category.featured);

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-[#0A2F5B] text-white py-16 md:py-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-repeat"></div>

        {/* Animated Particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-24 h-24 rounded-full bg-[#F9B92E]/10"></div>
          <div className="absolute top-40 right-20 w-16 h-16 rounded-full bg-[#F9B92E]/5"></div>
          <div className="absolute bottom-20 left-1/4 w-20 h-20 rounded-full bg-[#F9B92E]/5"></div>
          <div className="absolute top-1/3 right-1/3 w-12 h-12 rounded-full bg-[#F9B92E]/10"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block mb-4">
              <div className="h-1 w-20 bg-[#F9B92E] mx-auto"></div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Explore by <span className="text-[#F9B92E]">Category</span>
            </h1>
            <p className="text-xl text-gray-300">
              Discover travel stories organized by your favorite categories
            </p>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" fill="#ffffff" preserveAspectRatio="none">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Featured Categories Grid with Custom Icons */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0A2F5B] mb-4">Featured Categories</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our most popular travel categories and discover amazing stories
            </p>
            <div className="h-1 w-20 bg-[#F9B92E] mx-auto mt-6"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCategories.map((category, index) => (
              <div key={index} className="flex flex-col items-center text-center transition-transform hover:-translate-y-2 duration-300">
                <div className="w-24 h-24 flex items-center justify-center mb-4">
                  <img
                    src={category.iconPath}
                    alt={`${category.name} icon`}
                    width={96}
                    height={96}
                    className="w-full h-full"
                  />
                </div>
                <h3 className="text-xl font-semibold text-[#0A2F5B] mb-2">{category.name}</h3>
                <a href={`/categories/${category.slug}`} className="text-[#F9B92E] hover:underline">View stories</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0A2F5B] mb-4">All Categories</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse our complete collection of travel categories
            </p>
            <div className="h-1 w-20 bg-[#F9B92E] mx-auto mt-6"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((category, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex items-center space-x-4 hover:-translate-y-1 group"
              >
                <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <img
                    src={category.iconPath}
                    alt={`${category.name} icon`}
                    width={48}
                    height={48}
                    className="w-full h-full"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#0A2F5B] group-hover:text-[#F9B92E] transition-colors duration-300">{category.name}</h3>
                  <a href={`/categories/${category.slug}`} className="text-sm text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">View stories</a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-6">
              Can't find what you're looking for? We're constantly adding new categories.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-[#0A2F5B] text-white font-semibold rounded-md hover:bg-opacity-90 transition-colors duration-300"
            >
              Suggest a Category
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
