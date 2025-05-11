import UnsplashHero from './components/UnsplashHero';

// Define sample featured stories
const FEATURED_STORIES = [
  {
    id: 1,
    title: "Exploring the Hidden Gems of Mediterranean Cruises",
    excerpt: "Discover the lesser-known ports and experiences that make Mediterranean cruises truly special.",
    category: "Cruises",
    imageUrl: "/images/placeholder.svg",
  },
  {
    id: 2,
    title: "Top 10 Airlines for Long-Haul Comfort in 2023",
    excerpt: "We review the best airlines for those lengthy international flights, focusing on comfort and service.",
    category: "Airlines",
    imageUrl: "/images/placeholder.svg",
  },
  {
    id: 3,
    title: "Luxury Stays: Boutique Hotels Worth the Splurge",
    excerpt: "These unique boutique hotels offer experiences that go far beyond the typical luxury accommodation.",
    category: "Hotels",
    imageUrl: "/images/placeholder.svg",
  },
];

// Define sample latest stories
const LATEST_STORIES = [
  {
    id: 4,
    title: "A Food Lover's Guide to Tokyo",
    excerpt: "From street food to Michelin stars, Tokyo offers an unparalleled culinary journey.",
    category: "Food & Dining",
    imageUrl: "/images/placeholder.svg",
  },
  {
    id: 5,
    title: "Sustainable Travel: Eco-Friendly Destinations for 2023",
    excerpt: "These destinations are leading the way in sustainable tourism practices.",
    category: "Travel Tips",
    imageUrl: "/images/placeholder.svg",
  },
  {
    id: 6,
    title: "Adventure Awaits: Hiking the Inca Trail",
    excerpt: "Everything you need to know before embarking on this iconic Peruvian trek.",
    category: "Adventure",
    imageUrl: "/images/placeholder.svg",
  },
  {
    id: 7,
    title: "Cultural Immersion: Living with Nomads in Mongolia",
    excerpt: "Experience the traditional lifestyle of Mongolian nomads in this immersive travel experience.",
    category: "Culture",
    imageUrl: "/images/placeholder.svg",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <UnsplashHero
        imageUrl="https://images.unsplash.com/photo-1506863530036-1efeddceb993"
        photographerName="Rodrigo Soares"
        photographerUrl="https://unsplash.com/@rodrigosoares"
        height="tall"
      >
        <div className="max-w-3xl mx-auto text-center mt-8">
          <div className="inline-block mb-6">
            <div className="h-1 w-24 bg-brand-gold mx-auto"></div>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8 leading-tight tracking-tight">
            <span className="text-white drop-shadow-md">G'day from </span>
            <span className="text-brand-gold drop-shadow-md">Australia</span>
          </h1>
          <p className="text-xl md:text-2xl text-white mb-10 leading-relaxed max-w-2xl mx-auto font-light drop-shadow-md">
            Your trusted Australian source for travel insights, destination guides, and inspiring stories from Down Under and around the world.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6 mt-12">
            <a
              href="/destinations"
              className="px-8 py-4 bg-brand-gold text-brand-dark font-bold rounded-md hover:bg-brand-lightGold transition-all duration-300 shadow-lg group transform hover:scale-105"
            >
              <span className="inline-flex items-center">
                Explore Destinations
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </a>
            <a
              href="/categories"
              className="px-8 py-4 border-2 border-white text-white font-bold rounded-md hover:bg-white/10 transition-all duration-300 group transform hover:scale-105"
            >
              <span className="inline-flex items-center">
                Travel Categories
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </UnsplashHero>

      {/* Featured Stories Section */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <span className="text-brand-gold font-medium tracking-wider uppercase text-sm mb-3 inline-block">Latest Updates</span>
            <h2 className="text-4xl md:text-5xl font-bold text-brand-dark mb-6">Featured Stories</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover our handpicked selection of the most inspiring travel stories from Australia and around the globe
            </p>
            <div className="h-0.5 w-24 bg-brand-gold mx-auto mt-8"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-16">
            {FEATURED_STORIES.map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-lg border border-gray-100 group"
              >
                <div className="h-56 md:h-64 bg-brand-dark/10 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="inline-block px-3 py-1.5 text-xs font-semibold bg-brand-gold text-white rounded-full shadow-md">
                      {story.category}
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-brand-dark mb-3 group-hover:text-brand-gold transition-colors duration-300 leading-tight line-clamp-2">
                    {story.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed line-clamp-3">
                    {story.excerpt}
                  </p>
                  <a
                    href="#"
                    className="text-brand-gold hover:text-brand-lightGold font-medium inline-flex items-center transition-all duration-300 border-b border-transparent hover:border-brand-gold pb-1"
                  >
                    Read Full Story
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <a
              href="/stories"
              className="inline-flex items-center px-8 py-4 bg-brand-dark text-white font-bold rounded-md hover:bg-opacity-90 transition-all duration-300 shadow-md transform hover:translate-y-[-2px]"
            >
              View All Stories
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 md:py-32 bg-brand-light relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 bg-[url('/images/texture-pattern.svg')] bg-repeat"></div>

        {/* Gold Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-brand-gold"></div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="text-center mb-16">
            <span className="text-brand-gold font-medium tracking-wider uppercase text-sm mb-3 inline-block">Travel Interests</span>
            <h2 className="text-4xl md:text-5xl font-bold text-brand-dark mb-6">Explore by Category</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover Australian and international travel stories organized by your favorite categories
            </p>
            <div className="h-0.5 w-24 bg-brand-gold mx-auto mt-8"></div>
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            {['Cruises', 'Airlines', 'Hotels', 'Destinations'].map((category, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-lg border border-gray-100 group"
              >
                <div className="h-48 bg-gradient-to-br from-brand-dark to-brand-dark/80 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[url('/images/texture-pattern.svg')] bg-repeat"></div>
                  <div className="w-20 h-20 rounded-full bg-brand-gold/20 flex items-center justify-center backdrop-blur-sm z-10 transform group-hover:scale-110 transition-transform duration-300">
                    <span className="text-4xl text-brand-gold">
                      {index === 0 ? '🚢' : index === 1 ? '✈️' : index === 2 ? '🏨' : '🌍'}
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-brand-dark mb-3 group-hover:text-brand-gold transition-colors duration-300">
                    {category}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {index === 0
                      ? 'Ocean and river cruise experiences from Australia and beyond'
                      : index === 1
                        ? 'Airline reviews and flight experiences for Australian travelers'
                        : index === 2
                          ? 'Hotel reviews and accommodation tips for your next getaway'
                          : 'Guides about travel destinations popular with Australian travelers'
                    }
                  </p>
                  <a
                    href="/categories"
                    className="text-brand-gold hover:text-brand-lightGold font-medium inline-flex items-center transition-all duration-300 border-b border-transparent hover:border-brand-gold pb-1"
                  >
                    View Stories
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-20">
            <a
              href="/categories"
              className="inline-flex items-center px-8 py-4 bg-brand-dark text-white font-bold rounded-md hover:bg-opacity-90 transition-all duration-300 shadow-md transform hover:translate-y-[-2px]"
            >
              View All Categories
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Latest Stories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-4">Latest Stories</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Stay up to date with our most recent travel insights and adventures
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {LATEST_STORIES.map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div className="h-40 bg-brand-dark/10 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-2">
                    <span className="inline-block px-2 py-1 text-xs font-semibold bg-brand-dark/10 text-brand-dark rounded-full">
                      {story.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-brand-dark mb-2 line-clamp-2">
                    {story.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {story.excerpt}
                  </p>
                  <a
                    href="#"
                    className="text-sm text-brand-gold hover:text-brand-lightGold font-medium inline-flex items-center"
                  >
                    Read more
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-brand-dark to-brand-blue-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Updated</h2>
            <p className="text-lg text-gray-300 mb-8">
              Subscribe to our newsletter to receive the latest travel stories, tips, and updates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <span className="px-8 py-3 bg-white/10 text-white rounded-md border border-white/20">
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}