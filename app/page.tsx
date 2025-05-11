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
      <section className="relative bg-brand-dark text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('/images/texture-pattern.svg')] bg-repeat"></div>

        {/* Hero Image */}
        <div className="absolute inset-0 opacity-20">
          <img
            src="/images/hero/vw-combo.svg"
            alt="Travel illustration"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Animated Particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-24 h-24 rounded-full bg-brand-gold/10 animate-float-slow"></div>
          <div className="absolute top-40 right-20 w-16 h-16 rounded-full bg-brand-gold/5 animate-float-medium"></div>
          <div className="absolute bottom-20 left-1/4 w-20 h-20 rounded-full bg-brand-gold/5 animate-float-fast"></div>
          <div className="absolute top-1/3 right-1/3 w-12 h-12 rounded-full bg-brand-gold/10 animate-float-medium"></div>
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block mb-4">
              <div className="h-1 w-20 bg-brand-gold mx-auto"></div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-white">Welcome to </span>
              <span className="text-brand-gold">Global Travel Report</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed">
              Your destination for inspiring travel stories, tips, and guides from around the world.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="/about"
                className="px-8 py-3 bg-brand-gold text-brand-dark font-semibold rounded-md hover:bg-brand-lightGold transition-colors duration-300 shadow-lg group"
              >
                <span className="inline-flex items-center">
                  Learn More
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </a>
              <a
                href="/categories"
                className="px-8 py-3 border-2 border-brand-gold text-brand-gold font-semibold rounded-md hover:bg-brand-gold/10 transition-colors duration-300 group"
              >
                <span className="inline-flex items-center">
                  Explore Categories
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" fill="#f5f5f7" preserveAspectRatio="none">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Featured Stories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-4">Featured Stories</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked selection of the most inspiring travel stories from around the globe
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURED_STORIES.map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div className="h-48 bg-brand-dark/10 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-2">
                    <span className="inline-block px-3 py-1 text-xs font-semibold bg-brand-dark/10 text-brand-dark rounded-full">
                      {story.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-brand-dark mb-2 line-clamp-2">
                    {story.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {story.excerpt}
                  </p>
                  <a
                    href="#"
                    className="text-brand-gold hover:text-brand-lightGold font-medium inline-flex items-center"
                  >
                    Read more
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

      {/* Categories Section */}
      <section className="py-16 bg-brand-light">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-4">Explore by Category</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover travel stories organized by your favorite categories
            </p>
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {['Cruises', 'Airlines', 'Hotels', 'Destinations'].map((category, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div className="h-40 bg-brand-dark flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-brand-gold/20 flex items-center justify-center">
                    <span className="text-3xl text-brand-gold">
                      {index === 0 ? '🚢' : index === 1 ? '✈️' : index === 2 ? '🏨' : '🌍'}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-brand-dark mb-2">
                    {category}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {index === 0
                      ? 'Ocean and river cruise experiences'
                      : index === 1
                        ? 'Airline reviews and flight experiences'
                        : index === 2
                          ? 'Hotel reviews and accommodation tips'
                          : 'Guides about travel destinations'
                    }
                  </p>
                  <a
                    href="/categories"
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

          <div className="text-center mt-10">
            <a
              href="/categories"
              className="inline-block px-6 py-3 bg-brand-dark text-white font-semibold rounded-md hover:bg-opacity-90 transition-colors duration-300"
            >
              View All Categories
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