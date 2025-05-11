export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-brand-dark text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('/images/texture-pattern.svg')] bg-repeat"></div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-white">Welcome to </span>
              <span className="text-brand-gold">Global Travel Report</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed">
              Your destination for inspiring travel stories, tips, and guides from around the world.
            </p>
            <p className="text-lg text-gray-400 mb-8">
              We're working hard to bring you amazing content. Stay tuned!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="/about"
                className="px-8 py-3 bg-brand-gold text-brand-dark font-semibold rounded-md hover:bg-brand-lightGold transition-colors duration-300 shadow-lg"
              >
                Learn More
              </a>
              <span
                className="px-8 py-3 border-2 border-brand-gold text-brand-gold font-semibold rounded-md animate-pulse"
              >
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Section (Placeholder) */}
      <section className="py-16 bg-brand-light">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-4">Explore by Category</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover travel stories organized by your favorite categories
            </p>
          </div>

          {/* Category Grid Placeholder */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-2"
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
                    {index === 0 ? 'Cruises' : index === 1 ? 'Airlines' : index === 2 ? 'Hotels' : 'Destinations'}
                  </h3>
                  <p className="text-gray-600">
                    {index === 0
                      ? 'Ocean and river cruise experiences'
                      : index === 1
                        ? 'Airline reviews and flight experiences'
                        : index === 2
                          ? 'Hotel reviews and accommodation tips'
                          : 'Guides about travel destinations'
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <a
              href="/about"
              className="inline-block px-6 py-3 bg-brand-dark text-white font-semibold rounded-md hover:bg-opacity-90 transition-colors duration-300"
            >
              View All Categories
            </a>
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