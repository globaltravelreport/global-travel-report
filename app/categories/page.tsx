export const metadata = {
  title: 'Categories - Global Travel Report',
  description: 'Explore travel stories by category. Find articles about cruises, airlines, hotels, destinations, food & dining, adventure, culture, and more.',
};

// Define the categories data
const CATEGORIES = [
  {
    name: 'Cruises',
    slug: 'cruises',
    icon: '🚢',
    description: 'Ocean and river cruise experiences, reviews, and news',
    featured: true,
  },
  {
    name: 'Airlines',
    slug: 'airlines',
    icon: '✈️',
    description: 'Airline reviews, news, and flight experiences',
    featured: true,
  },
  {
    name: 'Hotels',
    slug: 'hotels',
    icon: '🏨',
    description: 'Hotel reviews, luxury stays, and accommodation tips',
    featured: true,
  },
  {
    name: 'Destinations',
    slug: 'destinations',
    icon: '🌍',
    description: 'Guides and stories about travel destinations worldwide',
    featured: true,
  },
  {
    name: 'Travel Tips',
    slug: 'travel-tips',
    icon: '💡',
    description: 'Practical advice and tips for travelers',
    featured: true,
  },
  {
    name: 'Food & Dining',
    slug: 'food-dining',
    icon: '🍽️',
    description: 'Culinary experiences and food-focused travel',
    featured: true,
  },
  {
    name: 'Adventure',
    slug: 'adventure',
    icon: '🧗',
    description: 'Thrilling experiences and adventure travel',
    featured: true,
  },
  {
    name: 'Culture',
    slug: 'culture',
    icon: '🏛️',
    description: 'Cultural experiences, history, and heritage travel',
    featured: true,
  },
  {
    name: 'Nature',
    slug: 'nature',
    icon: '🌲',
    description: 'Nature-focused travel and outdoor experiences',
    featured: false,
  },
  {
    name: 'Luxury Travel',
    slug: 'luxury-travel',
    icon: '💎',
    description: 'Premium travel experiences and luxury destinations',
    featured: false,
  },
  {
    name: 'Budget Travel',
    slug: 'budget-travel',
    icon: '💰',
    description: 'Tips and destinations for traveling on a budget',
    featured: false,
  },
  {
    name: 'Family Travel',
    slug: 'family-travel',
    icon: '👨‍👩‍👧‍👦',
    description: 'Travel ideas and tips for families with children',
    featured: false,
  },
  {
    name: 'Solo Travel',
    slug: 'solo-travel',
    icon: '🧳',
    description: 'Advice and experiences for solo travelers',
    featured: false,
  },
];

export default function CategoriesPage() {
  // Get all main categories
  const mainCategories = CATEGORIES;
  
  // Group categories by featured status
  const featuredCategories = mainCategories.filter(category => category.featured);
  const otherCategories = mainCategories.filter(category => !category.featured);
  
  // Define the specific categories to show in the highlighted grid
  const highlightedCategories = CATEGORIES.slice(0, 8);

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-brand-dark text-white py-16 md:py-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('/images/texture-pattern.svg')] bg-repeat"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Explore by <span className="text-brand-gold">Category</span>
            </h1>
            <p className="text-xl text-gray-300">
              Discover travel stories organized by your favorite categories
            </p>
          </div>
        </div>
      </section>
      
      {/* Highlighted Categories Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {highlightedCategories.map((category, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div className="h-40 bg-brand-dark flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-brand-gold/20 flex items-center justify-center">
                    <span className="text-4xl">{category.icon}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-brand-dark mb-2">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {category.description}
                  </p>
                  <a 
                    href="#" 
                    className="text-brand-gold hover:text-brand-lightGold font-medium inline-flex items-center"
                  >
                    View stories
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* All Categories Section */}
      <section className="py-16 bg-brand-light">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-brand-dark mb-12">All Categories</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((category, index) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center space-x-4"
              >
                <div className="w-12 h-12 rounded-full bg-brand-dark flex items-center justify-center flex-shrink-0">
                  <span className="text-xl text-brand-gold">{category.icon}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-brand-dark">{category.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
