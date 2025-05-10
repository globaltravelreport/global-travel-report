import { type Metadata } from 'next';
import { getAllStories, getStoriesByCategory } from '@/src/utils/stories';
import { StoryCard } from '@/src/components/stories/StoryCard';
import { PopularStories } from '@/components/recommendations/PopularStories';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getSubcategories } from '@/src/config/categories';
import Link from 'next/link';
import { CategoryStructuredData } from '@/src/components/seo/CategoryStructuredData';

// Define the params type for Next.js 15
type CategoryParams = {
  category: string;
};

export async function generateMetadata({
  params,
}: {
  params: CategoryParams;
}): Promise<Metadata> {
  const category = getCategoryBySlug(params.category);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.globaltravelreport.com';

  if (!category) {
    return {
      title: 'Category Not Found - Global Travel Report',
      description: 'The requested category could not be found.',
    };
  }

  // Get subcategories if any
  const subcategories = getSubcategories(params.category);

  // Create keywords from category name, description, and keywords
  const keywordsList = [
    category.name,
    ...category.keywords,
    ...(subcategories.length > 0 ? subcategories.map(sub => sub.name) : []),
    'travel',
    'stories',
    'global travel report'
  ];

  return {
    title: `${category.name} Stories - Global Travel Report`,
    description: category.description || `Read travel stories about ${category.name} from around the world.`,
    keywords: keywordsList,
    openGraph: {
      title: `${category.name} Stories - Global Travel Report`,
      description: category.description || `Read travel stories about ${category.name} from around the world.`,
      url: `${siteUrl}/categories/${category.slug}`,
      type: 'website',
      siteName: 'Global Travel Report',
      locale: 'en_AU',
      images: [
        {
          url: `${siteUrl}/images/categories/${category.slug}.jpg`,
          width: 1200,
          height: 630,
          alt: `${category.name} - Global Travel Report`,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} Stories - Global Travel Report`,
      description: category.description || `Read travel stories about ${category.name} from around the world.`,
      creator: '@GTravelReport',
      site: '@GTravelReport',
      images: [`${siteUrl}/images/categories/${category.slug}.jpg`],
    },
    alternates: {
      canonical: `${siteUrl}/categories/${category.slug}`,
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function CategoryPage({ params }: { params: CategoryParams }) {
  // Get category information
  const categoryInfo = getCategoryBySlug(params.category);

  // If category doesn't exist, show 404
  if (!categoryInfo) {
    notFound();
  }

  const stories = await getAllStories();
  const categoryStoriesResult = getStoriesByCategory(stories, params.category);
  const categoryStories = categoryStoriesResult.data;

  // Get subcategories if any
  const subcategories = getSubcategories(params.category);

  if (categoryStories.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <span className="text-4xl mr-3">{categoryInfo.icon}</span>
          <h1 className="text-4xl font-bold">{categoryInfo.name}</h1>
        </div>
        <p className="text-gray-600 mb-8">{categoryInfo.description}</p>
        <p className="text-gray-600">No stories found for this category.</p>
      </div>
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.globaltravelreport.com';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Add structured data for SEO */}
      <CategoryStructuredData
        category={categoryInfo}
        subcategories={subcategories}
        storyCount={categoryStories.length}
        siteUrl={siteUrl}
      />

      <div className="flex items-center mb-4">
        <span className="text-4xl mr-3">{categoryInfo.icon}</span>
        <h1 className="text-4xl font-bold">{categoryInfo.name}</h1>
      </div>
      <p className="text-gray-600 mb-8">{categoryInfo.description}</p>

      {/* Subcategories if any */}
      {subcategories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Explore {categoryInfo.name} Subcategories</h2>
          <div className="flex flex-wrap gap-3">
            {subcategories.map(subcat => (
              <Link
                key={subcat.slug}
                href={`/categories/${subcat.slug}`}
                className="px-4 py-2 bg-[#19273A] text-[#C9A14A] rounded-full flex items-center hover:bg-[#2a3b52] transition-colors"
              >
                <span className="mr-2">{subcat.icon}</span>
                {subcat.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categoryStories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>

      {/* Popular Stories Section */}
      <div className="mt-16">
        <Suspense fallback={<div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-80"></div>
            ))}
          </div>
        </div>}>
          <PopularStories limit={3} title="You Might Also Like" />
        </Suspense>
      </div>
    </div>
  );
}