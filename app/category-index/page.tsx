import { Metadata } from 'next';
import Link from 'next/link';
import { CATEGORIES } from '@/src/config/categories';
import { CategoriesIndexStructuredData } from '@/src/components/seo/CategoriesIndexStructuredData';

export const metadata: Metadata = {
  title: 'Categories - Global Travel Report',
  description: 'Explore travel stories by category. Find articles about cruises, airlines, hotels, destinations, food & dining, adventure, culture, and more.',
};

export default function CategoryIndexPage() {
  // Get all main categories (those without a parent)
  const mainCategories = CATEGORIES.filter(category => !category.parent);

  // Group categories by featured status
  const featuredCategories = mainCategories.filter(category => category.featured);
  const otherCategories = mainCategories.filter(category => !category.featured);

  // Define the specific categories to show in the highlighted grid
  const highlightedCategories = [
    CATEGORIES.find(c => c.slug === 'cruises'),
    CATEGORIES.find(c => c.slug === 'airlines'),
    CATEGORIES.find(c => c.slug === 'hotels'),
    CATEGORIES.find(c => c.slug === 'destinations'),
    CATEGORIES.find(c => c.slug === 'travel-tips'),
    CATEGORIES.find(c => c.slug === 'food-dining'),
    CATEGORIES.find(c => c.slug === 'adventure'),
    CATEGORIES.find(c => c.slug === 'culture'),
  ].filter(Boolean);

  return (
    <>
      <CategoriesIndexStructuredData
        featuredCategories={featuredCategories}
        otherCategories={otherCategories}
      />

      <div className="bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 relative inline-block">
              <span className="relative z-10">Explore by Category</span>
              <span className="absolute bottom-0 left-0 w-full h-3 bg-[#C9A14A]/20 -z-10 transform -rotate-1"></span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover travel stories organized by your favorite categories
            </p>
          </div>

          {/* Highlighted Categories Grid - Matching the home page layout */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {highlightedCategories.map((category) => {
              if (!category) return null;
              return (
                <Link
                  key={category.slug}
                  href={`/categories/${category.slug}`}
                  className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-all duration-300 group hover:translate-y-[-4px] border border-gray-100 overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#C9A14A]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="text-5xl mb-4 block group-hover:scale-110 transition-transform duration-500">{category.icon}</span>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h2>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{category.description}</p>
                </Link>
              );
            })}
          </div>

          {/* All Featured Categories */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredCategories
                .filter(cat => !highlightedCategories.some(hc => hc && hc.slug === cat.slug))
                .map((category) => (
                  <Link
                    key={category.slug}
                    href={`/categories/${category.slug}`}
                    className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all duration-300 flex items-center gap-3 border border-gray-100"
                  >
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                    </div>
                  </Link>
                ))}
            </div>
          </div>

          {/* Other Categories */}
          {otherCategories.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">More Categories</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {otherCategories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/categories/${category.slug}`}
                    className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all duration-300 flex items-center gap-3 border border-gray-100"
                  >
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
