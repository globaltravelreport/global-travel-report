import { Metadata } from 'next';
import Link from 'next/link';
import { CATEGORIES } from '@/src/config/categories';
import { notFound } from 'next/navigation';
import { getAllStories, getStoriesByCategory } from '@/src/utils/stories';
import { Story } from '@/types/Story';
import Image from 'next/image';

type CategoryPageProps = {
  params: {
    slug: string;
  };
};

async function getCategoryStories(categorySlug: string): Promise<Story[]> {
  try {
    const allStories = await getAllStories();
    const categoryResult = getStoriesByCategory(allStories, categorySlug, { page: 1, limit: 100 });
    return categoryResult.data;
  } catch (error) {
    console.error('Error fetching category stories:', error);
    return [];
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://globaltravelreport.com';

  // Find the category in the config
  const categoryData = CATEGORIES.find(cat => cat.slug === slug);

  if (!categoryData) {
    return {
      title: 'Category Not Found - Global Travel Report',
      description: 'The requested category could not be found.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const categoryUrl = `${baseUrl}/categories/${slug}`;
  const categoryImage = `https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&q=80&w=1200&h=600`;

  return {
    title: `${categoryData.name} - Global Travel Report`,
    description: categoryData.description || `Explore travel stories about ${categoryData.name}. Find the latest news, tips, and insights.`,
    alternates: {
      canonical: categoryUrl,
    },
    openGraph: {
      title: `${categoryData.name} - Global Travel Report`,
      description: categoryData.description || `Explore travel stories about ${categoryData.name}. Find the latest news, tips, and insights.`,
      url: categoryUrl,
      siteName: 'Global Travel Report',
      images: [
        {
          url: categoryImage,
          width: 1200,
          height: 630,
          alt: `${categoryData.name} - Travel Stories and Guides`,
        },
      ],
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${categoryData.name} - Global Travel Report`,
      description: categoryData.description || `Explore travel stories about ${categoryData.name}. Find the latest news, tips, and insights.`,
      images: [categoryImage],
      site: '@globaltravelreport',
      creator: '@globaltravelreport',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    category: 'travel',
    keywords: [...categoryData.keywords, 'travel', 'tourism', categoryData.name.toLowerCase()],
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params;

  // Find the category in the config
  const categoryData = CATEGORIES.find(cat => cat.slug === slug);

  // If category not found, return 404
  if (!categoryData) {
    notFound();
  }

  // Get parent category if this is a subcategory
  const parentCategory = categoryData.parent
    ? CATEGORIES.find(cat => cat.slug === categoryData.parent)
    : null;

  // Get subcategories if this is a parent category
  const subcategories = CATEGORIES.filter(cat => cat.parent === slug);

  // Get related categories (siblings if this is a subcategory, or other main categories if this is a parent)
  const relatedCategories = categoryData.parent
    ? CATEGORIES.filter(cat => cat.parent === categoryData.parent && cat.slug !== slug).slice(0, 4)
    : CATEGORIES.filter(cat => !cat.parent && cat.slug !== slug).slice(0, 4);

  // Fetch stories for this category
  const categoryStories = await getCategoryStories(slug);

  // Separate recent and archived stories
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentStories = categoryStories.filter(story => {
    const storyDate = new Date(story.publishedAt || '');
    return storyDate >= thirtyDaysAgo;
  });

  const archivedStories = categoryStories.filter(story => {
    const storyDate = new Date(story.publishedAt || '');
    return storyDate < thirtyDaysAgo;
  });

  // Get unique countries and tags for filtering
  const countries = Array.from(new Set(categoryStories.map(s => s.country).filter(Boolean))).sort();
  const allTags = Array.from(new Set(categoryStories.flatMap(s => s.tags))).sort();

  // Get travel styles from tags (family, luxury, budget, etc.)
  const travelStyles = allTags.filter(tag =>
    ['family', 'luxury', 'budget', 'solo', 'adventure', 'romantic', 'business', 'eco-friendly', 'accessible'].includes(tag.toLowerCase())
  );

  // Get featured/popular tags (excluding travel styles)
  const popularTags = allTags
    .filter(tag => !travelStyles.includes(tag))
    .slice(0, 10);

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center text-sm text-gray-600 mb-8">
          <ol className="flex items-center">
            <li>
              <a href="/" className="hover:text-[#C9A14A] transition-colors">Home</a>
            </li>
            <li className="flex items-center mx-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li>
              <a href="/categories" className="hover:text-[#C9A14A] transition-colors">Categories</a>
            </li>
            {parentCategory && (
              <>
                <li className="flex items-center mx-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </li>
                <li>
                  <a href={`/categories/${parentCategory.slug}`} className="hover:text-[#C9A14A] transition-colors">
                    {parentCategory.name}
                  </a>
                </li>
              </>
            )}
            <li className="flex items-center mx-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li>
              <span className="text-gray-900 font-medium">{categoryData.name}</span>
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-4">
            <span className="text-6xl mb-4">{categoryData.icon}</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 relative inline-block">
            <span className="relative z-10">{categoryData.name}</span>
            <span className="absolute bottom-0 left-0 w-full h-3 bg-[#C9A14A]/20 -z-10 transform -rotate-1"></span>
          </h1>
          {categoryData.description && (
            <p className="text-gray-600 max-w-2xl mx-auto">
              {categoryData.description}
            </p>
          )}
          <div className="mt-4 text-sm text-gray-500">
            {categoryStories.length} stories • {recentStories.length} recent • {archivedStories.length} archived
          </div>
        </div>

        {/* Filtering Section */}
        {categoryStories.length > 6 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Stories</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Travel Styles Filter */}
              {travelStyles.length > 0 && (
                <div>
                  <label htmlFor="travel-style-filter" className="block text-sm font-medium text-gray-700 mb-2">
                    Travel Style
                  </label>
                  <div className="space-y-2" id="travel-style-filter">
                    {travelStyles.slice(0, 5).map((style) => (
                      <label key={style} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`travel-style-${style.toLowerCase().replace(/\s+/g, '-')}`}
                          className="rounded border-gray-300 text-[#C9A14A] focus:ring-[#C9A14A]"
                          onChange={(e) => {
                            // Filter functionality would be implemented here
                            console.log(`Filter by travel style: ${style}`);
                          }}
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{style}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Destinations Filter */}
              {countries.length > 0 && (
                <div>
                  <label htmlFor="destinations-filter" className="block text-sm font-medium text-gray-700 mb-2">
                    Destinations
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto" id="destinations-filter">
                    {countries.slice(0, 6).map((country) => (
                      <label key={country} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`destination-${country.toLowerCase().replace(/\s+/g, '-')}`}
                          className="rounded border-gray-300 text-[#C9A14A] focus:ring-[#C9A14A]"
                          onChange={(e) => {
                            console.log(`Filter by destination: ${country}`);
                          }}
                        />
                        <span className="ml-2 text-sm text-gray-700">{country}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags Filter */}
              {popularTags.length > 0 && (
                <div>
                  <label htmlFor="topics-filter" className="block text-sm font-medium text-gray-700 mb-2">
                    Topics
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto" id="topics-filter">
                    {popularTags.slice(0, 6).map((tag) => (
                      <label key={tag} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`topic-${tag.toLowerCase().replace(/\s+/g, '-')}`}
                          className="rounded border-gray-300 text-[#C9A14A] focus:ring-[#C9A14A]"
                          onChange={(e) => {
                            console.log(`Filter by tag: ${tag}`);
                          }}
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  // Clear all filters
                  console.log('Clear all filters');
                }}
                className="text-sm text-[#C9A14A] hover:text-[#B89038] font-medium"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}

        {/* Parent Category Link (if this is a subcategory) */}
        {parentCategory && (
          <div className="mb-8 text-center">
            <Link
              href={`/categories/${parentCategory.slug}`}
              className="inline-flex items-center gap-2 text-[#C9A14A] hover:underline"
            >
              <span className="text-xl">{parentCategory.icon}</span>
              <span>Back to {parentCategory.name}</span>
            </Link>
          </div>
        )}

        {/* Recent Stories Section */}
        {recentStories.length > 0 && (
          <section className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Recent {categoryData.name} Stories</h2>
              <Link
                href="/archive"
                className="text-[#C9A14A] hover:text-[#B89038] font-medium"
              >
                View All Archive →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
              {recentStories.slice(0, 6).map((story) => (
                <article key={story.id} className="group card hover:shadow-xl overflow-hidden">
                  <Link href={`/stories/${story.slug}`}>
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={story.imageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&q=80&w=800&h=600'}
                        alt={story.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Category Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-800 backdrop-blur-sm">
                          {story.category}
                        </span>
                      </div>

                      {/* Featured Badge */}
                      {story.featured && (
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                            Featured
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#C9A14A] transition-colors duration-300 leading-tight">
                        {story.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                        {story.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>By {story.author}</span>
                        {story.publishedAt && (
                          <time dateTime={new Date(story.publishedAt).toISOString()}>
                            {new Date(story.publishedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </time>
                        )}
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Subcategories (if this is a parent category) */}
        {subcategories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Subcategories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {subcategories.map((subcat) => (
                <Link
                  key={subcat.slug}
                  href={`/categories/${subcat.slug}`}
                  className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all duration-300 flex items-center gap-3 border border-gray-100"
                >
                  <span className="text-2xl">{subcat.icon}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{subcat.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Archived Stories Section */}
        {archivedStories.length > 0 && (
          <section className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Archived {categoryData.name} Stories</h2>
              <Link
                href="/archive"
                className="text-[#C9A14A] hover:text-[#B89038] font-medium"
              >
                Browse Full Archive →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {archivedStories.slice(0, 8).map((story) => (
                <article key={story.id} className="group card hover:shadow-lg overflow-hidden border border-gray-200">
                  <Link href={`/stories/${story.slug}`}>
                    <div className="relative h-32 overflow-hidden">
                      <Image
                        src={story.imageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&q=80&w=400&h=300'}
                        alt={story.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                      {/* Archived Badge */}
                      <div className="absolute top-2 left-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-600 text-white">
                          Archived
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">{story.title}</h4>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>By {story.author}</span>
                        <time dateTime={new Date(story.publishedAt).toISOString()}>
                          {new Date(story.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </time>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Related Categories */}
        {relatedCategories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Related Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedCategories.map((relCat) => (
                <Link
                  key={relCat.slug}
                  href={`/categories/${relCat.slug}`}
                  className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all duration-300 flex items-center gap-3 border border-gray-100"
                >
                  <span className="text-2xl">{relCat.icon}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{relCat.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/categories"
              className="inline-flex items-center px-6 py-3 bg-[#C9A14A] hover:bg-[#B89038] text-white font-medium rounded-lg transition-colors duration-200"
            >
              View All Categories
            </Link>
            <Link
              href="/archive"
              className="inline-flex items-center px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors duration-200"
            >
              Browse Full Archive
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            Recent stories: Last 30 days • Archive: Complete collection (12+ months)
          </p>
        </div>
      </div>
    </div>
  );
}
