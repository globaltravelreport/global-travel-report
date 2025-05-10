import { Metadata } from 'next';
import Link from 'next/link';
import { CATEGORIES } from '@/src/config/categories';
import { notFound } from 'next/navigation';

type CategoryPageProps = {
  params: {
    category: string;
  };
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = params;
  
  // Find the category in the config
  const categoryData = CATEGORIES.find(cat => cat.slug === category);
  
  if (!categoryData) {
    return {
      title: 'Category Not Found - Global Travel Report',
      description: 'The requested category could not be found.',
    };
  }
  
  return {
    title: `${categoryData.name} - Global Travel Report`,
    description: categoryData.description || `Explore travel stories about ${categoryData.name}. Find the latest news, tips, and insights.`,
    keywords: [
      categoryData.name.toLowerCase(),
      'travel',
      'global travel',
      'travel stories',
      'travel news',
      'travel tips',
    ],
    openGraph: {
      title: `${categoryData.name} - Global Travel Report`,
      description: categoryData.description || `Explore travel stories about ${categoryData.name}. Find the latest news, tips, and insights.`,
      type: 'website',
      url: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/category-index/${category}` : `https://www.globaltravelreport.com/category-index/${category}`,
      siteName: 'Global Travel Report',
      locale: 'en_AU',
      images: [
        {
          url: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/images/categories/${category}.jpg` : `https://www.globaltravelreport.com/images/categories/${category}.jpg`,
          width: 1200,
          height: 630,
          alt: `${categoryData.name} - Global Travel Report`,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${categoryData.name} - Global Travel Report`,
      description: categoryData.description || `Explore travel stories about ${categoryData.name}. Find the latest news, tips, and insights.`,
      creator: '@GTravelReport',
      site: '@GTravelReport',
      images: [process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/images/categories/${category}.jpg` : `https://www.globaltravelreport.com/images/categories/${category}.jpg`],
    },
    alternates: {
      canonical: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/category-index/${category}` : `https://www.globaltravelreport.com/category-index/${category}`,
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

export default function CategoryPage({ params }: CategoryPageProps) {
  const { category } = params;
  
  // Find the category in the config
  const categoryData = CATEGORIES.find(cat => cat.slug === category);
  
  // If category not found, return 404
  if (!categoryData) {
    notFound();
  }
  
  // Get parent category if this is a subcategory
  const parentCategory = categoryData.parent 
    ? CATEGORIES.find(cat => cat.slug === categoryData.parent) 
    : null;
  
  // Get subcategories if this is a parent category
  const subcategories = CATEGORIES.filter(cat => cat.parent === category);
  
  // Get related categories (siblings if this is a subcategory, or other main categories if this is a parent)
  const relatedCategories = categoryData.parent
    ? CATEGORIES.filter(cat => cat.parent === categoryData.parent && cat.slug !== category).slice(0, 4)
    : CATEGORIES.filter(cat => !cat.parent && cat.slug !== category).slice(0, 4);

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        </div>

        {/* Parent Category Link (if this is a subcategory) */}
        {parentCategory && (
          <div className="mb-8 text-center">
            <Link 
              href={`/category-index/${parentCategory.slug}`}
              className="inline-flex items-center gap-2 text-[#C9A14A] hover:underline"
            >
              <span className="text-xl">{parentCategory.icon}</span>
              <span>Back to {parentCategory.name}</span>
            </Link>
          </div>
        )}

        {/* Subcategories (if this is a parent category) */}
        {subcategories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Subcategories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {subcategories.map((subcat) => (
                <Link
                  key={subcat.slug}
                  href={`/category-index/${subcat.slug}`}
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

        {/* Related Categories */}
        {relatedCategories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Related Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedCategories.map((relCat) => (
                <Link
                  key={relCat.slug}
                  href={`/category-index/${relCat.slug}`}
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

        {/* Back to All Categories */}
        <div className="text-center mt-12">
          <Link 
            href="/category-index"
            className="inline-flex items-center gap-2 text-[#C9A14A] hover:underline"
          >
            <span>View All Categories</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
