export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Server-side rendered for better performance */}
      <div className="relative h-[70vh] w-full overflow-hidden">
        <picture>
          <source srcSet="/images/news-hero-1920.webp" type="image/webp" />
          <source srcSet="/images/news-hero-1920.jpg" type="image/jpeg" />
          <img
            src="/images/news-hero-1920.jpg"
            alt="Iconic travel scenery showcasing global destinations"
            className="w-full h-full object-cover"
            loading="eager"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-black text-center mb-6 tracking-tight leading-tight">
            Global Travel Report
          </h1>
          <p className="text-xl md:text-2xl text-center mb-12 max-w-2xl font-medium leading-relaxed">
            Your destination for inspiring travel stories, tips, and guides from around the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <a
              href="/destinations"
              className="bg-gradient-to-r from-[#C9A14A] to-[#B08D3F] hover:from-[#D5B05C] hover:to-[#C9A14A] text-white font-bold py-4 px-10 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#C9A14A] focus:ring-offset-2 shadow-lg hover:shadow-xl"
            >
              Explore Destinations
            </a>
            <a
              href="/categories"
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/30 font-bold py-4 px-10 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 shadow-lg hover:shadow-xl"
            >
              Browse Categories
            </a>
          </div>
        </div>
        <div className="absolute bottom-2 right-2 text-white text-xs bg-black/50 px-2 py-1 rounded">
          Photo by <a
            href="https://unsplash.com/@jakobowens1"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-200"
          >
            Jakob Owens
          </a> on <a
            href="https://unsplash.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-200"
          >
            Unsplash
          </a>
        </div>
      </div>

      {/* Quick Links Section */}
      <div className="max-w-4xl mx-auto px-4 pb-12 sm:pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <a href="/categories-main" className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Explore Categories</h3>
            <p className="text-gray-600 text-sm">Browse travel stories by category</p>
          </a>
          <a href="/destinations" className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Destinations</h3>
            <p className="text-gray-600 text-sm">Discover amazing places to visit</p>
          </a>
          <a href="/search" className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 text-center sm:col-span-2 lg:col-span-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Search</h3>
            <p className="text-gray-600 text-sm">Find specific travel content</p>
          </a>
        </div>
      </div>
    </div>
  );
}