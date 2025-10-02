import Link from 'next/link';
import Image from 'next/image';
import { CATEGORIES, getFeaturedCategories } from '@/src/config/categories';
import { StoryDatabase } from '@/src/services/storyDatabase';
import { Story } from '@/types/Story';

const CATEGORY_IMAGES: Record<string, string> = {
  'cruises': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&q=80&w=1200&h=600',
  'airlines': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&q=80&w=1200&h=600',
  'hotels': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&q=80&w=1200&h=600',
  'destinations': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&q=80&w=1200&h=600',
  'travel-tips': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&q=80&w=1200&h=600',
  'food-dining': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&q=80&w=1200&h=600',
  'adventure': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&q=80&w=1200&h=600',
  'culture': 'https://images.unsplash.com/photo-1467269204594-9661b13412d7?auto=format&q=80&w=1200&h=600',
  'nature': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&q=80&w=1200&h=600',
  'luxury-travel': 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&q=80&w=1200&h=600',
  'budget-travel': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&q=80&w=1200&h=600',
  'family-travel': 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&q=80&w=1200&h=600',
  'solo-travel': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&q=80&w=1200&h=600'
};

export default async function CategoryGrid() {
  const featuredCategories = getFeaturedCategories();

  // Server-side data fetching
  let stories: Story[] = [];
  try {
    const storyDb = StoryDatabase.getInstance();
    stories = await storyDb.getAllStories();
  } catch (error) {
    console.error('Error loading stories for category grid:', error);
    // Continue with empty stories array
  }

  // Get story count for each category
  const getCategoryStoryCount = (categorySlug: string) => {
    return stories.filter((story: Story) =>
      story.category && story.category.toLowerCase() === categorySlug.toLowerCase()
    ).length;
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Choose Your Adventure
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          From luxury cruises to budget backpacking, find the perfect travel inspiration for your next journey
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {featuredCategories.map((category, index) => {
          const imageUrl = CATEGORY_IMAGES[category.slug] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&q=80&w=1200&h=600';

          return (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 ease-out transform hover:-translate-y-2 overflow-hidden focus:outline-none focus:ring-4 focus:ring-[#C9A14A] focus:ring-offset-2 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Category Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={`${category.name} travel stories and guides`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Category Icon */}
                <div className="absolute top-4 right-4 text-3xl">
                  {category.icon}
                </div>

                {/* Category Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-2 transform transition-transform duration-300 group-hover:translate-y-0">
                    {category.name}
                  </h3>
                  <div className="w-12 h-1 bg-[#C9A14A] transition-all duration-300 group-hover:w-20"></div>
                </div>
              </div>

              {/* Category Description */}
              <div className="p-6">
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {category.description}
                </p>

                {/* Story Count */}
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                    {getCategoryStoryCount(category.slug)} {getCategoryStoryCount(category.slug) === 1 ? 'Story' : 'Stories'}
                  </span>
                </div>

                {/* Category Keywords */}
                <div className="flex flex-wrap gap-2">
                  {category.keywords.slice(0, 3).map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-block px-3 py-1 text-xs font-medium text-[#C9A14A] bg-[#C9A14A]/10 rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#C9A14A]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </Link>
          );
        })}
      </div>

      {/* Call to Action */}
      <div className="text-center mt-16">
        <div className="bg-gradient-to-r from-[#C9A14A]/10 to-[#B89038]/10 rounded-2xl p-8 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Explore?
          </h3>
          <p className="text-gray-600 mb-6">
            Browse all our categories or search for specific destinations and travel tips
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/categories"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-[#C9A14A] hover:bg-[#B89038] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#C9A14A] focus:ring-offset-2"
            >
              View All Categories
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#C9A14A] focus:ring-offset-2"
            >
              Search Stories
            </Link>
          </div>
        </div>
      </div>

    </section>
  );
}