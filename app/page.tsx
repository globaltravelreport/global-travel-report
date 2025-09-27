import Hero from '@/components/Hero';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section (reused component to match Destinations style and credit) */}
      <Hero
        title="Global Travel Report"
        subtitle="Your destination for inspiring travel stories, tips, and guides from around the world."
        alt="Global Travel Report hero image with iconic travel scenery"
        primaryCtaText="Explore Destinations"
        primaryCtaHref="/destinations"
        secondaryCtaText="Browse Categories"
        secondaryCtaHref="/categories"
        enableRotation={false}
        defaultImage="/images/news-hero-1920.webp"
      />

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