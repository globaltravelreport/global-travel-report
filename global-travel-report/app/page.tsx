export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-12 sm:py-24">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-700 mb-4 sm:mb-6 drop-shadow">
          Welcome to Global Travel Report
        </h1>
        <p className="text-lg sm:text-xl text-blue-900 mb-6 sm:mb-8 max-w-2xl leading-relaxed">
          Your destination for inspiring travel stories, tips, and guides from around the world.
          <br className="hidden sm:block" />
          <span className="block sm:inline"> We're working hard to bring you amazing content. Stay tuned!</span>
        </p>
        <span className="inline-block bg-blue-200 text-blue-800 px-4 sm:px-6 py-2 rounded-full font-semibold text-base sm:text-lg mb-6 sm:mb-8 animate-pulse">
          Coming Soon
        </span>
        <a href="/about" className="text-blue-600 underline hover:text-blue-800 font-medium text-base sm:text-lg">
          Learn more about us
        </a>
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