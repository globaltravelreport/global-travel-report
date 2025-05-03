import { Story } from '@/types/Story';
import { getCategoryBySlug, findBestMatchingCategory } from '@/src/config/categories';

/**
 * Generate NewsArticle schema.org structured data for a story
 * @param story - The story to generate schema for
 * @param siteUrl - The base URL of the site
 * @returns JSON-LD schema object for the story
 */
export function generateNewsArticleSchema(story: Story, siteUrl: string = 'https://www.globaltravelreport.com') {
  const publishedDate = story.publishedAt instanceof Date
    ? story.publishedAt.toISOString()
    : new Date(story.publishedAt).toISOString();

  const updatedDate = story.updatedAt
    ? (story.updatedAt instanceof Date ? story.updatedAt.toISOString() : new Date(story.updatedAt).toISOString())
    : publishedDate;

  const imageUrl = story.imageUrl?.startsWith('http')
    ? story.imageUrl
    : `${siteUrl}${story.imageUrl || '/images/default-story.jpg'}`;

  // Get category information if available
  const categorySlug = story.category?.toLowerCase().replace(/\s+/g, '-');
  const categoryInfo = categorySlug ? getCategoryBySlug(categorySlug) || findBestMatchingCategory(story.category) : null;

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'headline': story.title,
    'description': story.excerpt,
    'image': [imageUrl],
    'author': {
      '@type': 'Organization',
      'name': 'Global Travel Report Editorial Team',
      'url': siteUrl
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Global Travel Report',
      'url': siteUrl,
      'logo': {
        '@type': 'ImageObject',
        'url': `${siteUrl}/images/logo.png`,
        'width': '192',
        'height': '192'
      }
    },
    'datePublished': publishedDate,
    'dateModified': updatedDate,
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `${siteUrl}/stories/${story.slug}`
    },
    'keywords': story.tags.join(', '),
    'articleSection': categoryInfo?.name || story.category,
    'isAccessibleForFree': 'True',
    'speakable': {
      '@type': 'SpeakableSpecification',
      'cssSelector': ['article h1', 'article p']
    }
  };
}

/**
 * Generate Article schema.org structured data for a story
 * @param story - The story to generate schema for
 * @param siteUrl - The base URL of the site
 * @returns JSON-LD schema object for the story
 */
export function generateArticleSchema(story: Story, siteUrl: string = 'https://www.globaltravelreport.com') {
  const publishedDate = story.publishedAt instanceof Date
    ? story.publishedAt.toISOString()
    : new Date(story.publishedAt).toISOString();

  const updatedDate = story.updatedAt
    ? (story.updatedAt instanceof Date ? story.updatedAt.toISOString() : new Date(story.updatedAt).toISOString())
    : publishedDate;

  const imageUrl = story.imageUrl?.startsWith('http')
    ? story.imageUrl
    : `${siteUrl}${story.imageUrl || '/images/default-story.jpg'}`;

  // Get category information if available
  const categorySlug = story.category?.toLowerCase().replace(/\s+/g, '-');
  const categoryInfo = categorySlug ? getCategoryBySlug(categorySlug) || findBestMatchingCategory(story.category) : null;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': story.title,
    'description': story.excerpt,
    'image': imageUrl,
    'author': {
      '@type': 'Organization',
      'name': 'Global Travel Report Editorial Team',
      'url': siteUrl
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Global Travel Report',
      'url': siteUrl,
      'logo': {
        '@type': 'ImageObject',
        'url': `${siteUrl}/images/logo.png`,
        'width': '192',
        'height': '192'
      }
    },
    'datePublished': publishedDate,
    'dateModified': updatedDate,
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `${siteUrl}/stories/${story.slug}`
    },
    'keywords': story.tags.join(', '),
    'articleSection': categoryInfo?.name || story.category
  };
}

/**
 * Generate TravelDestination schema.org structured data
 * @param story - The story to generate schema for
 * @param siteUrl - The base URL of the site
 * @returns JSON-LD schema object for the travel destination
 */
export function generateTravelDestinationSchema(story: Story, siteUrl: string = 'https://www.globaltravelreport.com') {
  // Only generate this schema if the story has a country
  if (!story.country || story.country === 'Global') {
    return null;
  }

  const imageUrl = story.imageUrl?.startsWith('http')
    ? story.imageUrl
    : `${siteUrl}${story.imageUrl || '/images/default-story.jpg'}`;

  // Get category information if available
  const categorySlug = story.category?.toLowerCase().replace(/\s+/g, '-');
  const categoryInfo = categorySlug ? getCategoryBySlug(categorySlug) || findBestMatchingCategory(story.category) : null;

  // Determine if this is a cruise destination
  const isCruiseDestination =
    categoryInfo?.slug === 'cruises' ||
    categoryInfo?.slug === 'cruise-ships' ||
    categoryInfo?.slug === 'cruise-lines' ||
    categoryInfo?.parent === 'cruises' ||
    story.category?.toLowerCase().includes('cruise');

  return {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    'name': story.country,
    'description': story.excerpt,
    'image': [imageUrl],
    'url': `${siteUrl}/stories/${story.slug}`,
    'touristType': story.tags.join(', '),
    'geo': {
      '@type': 'GeoCoordinates',
      'address': {
        '@type': 'PostalAddress',
        'addressCountry': story.country
      }
    },
    'includesAttraction': [
      {
        '@type': isCruiseDestination ? 'BoatTrip' : 'TouristAttraction',
        'name': story.title.replace(/^Title: /, ''),
        'description': story.excerpt,
        'url': `${siteUrl}/stories/${story.slug}`
      }
    ],
    'availableLanguage': {
      '@type': 'Language',
      'name': 'English'
    }
  };
}

/**
 * Generate FAQPage schema.org structured data if the story contains FAQs
 * @param story - The story to generate schema for
 * @param siteUrl - The base URL of the site
 * @returns JSON-LD schema object for FAQs or null if no FAQs
 */
export function generateFAQSchema(story: Story, siteUrl: string = 'https://www.globaltravelreport.com') {
  // Check if the story has FAQs
  if (!story.faqs || story.faqs.length === 0) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': story.faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  };
}

/**
 * Generate BreadcrumbList schema.org structured data
 * @param story - The story to generate schema for
 * @param siteUrl - The base URL of the site
 * @returns JSON-LD schema object for breadcrumbs
 */
export function generateBreadcrumbSchema(story: Story, siteUrl: string = 'https://www.globaltravelreport.com') {
  const breadcrumbItems = [
    {
      '@type': 'ListItem',
      'position': 1,
      'name': 'Home',
      'item': siteUrl
    },
    {
      '@type': 'ListItem',
      'position': 2,
      'name': 'Stories',
      'item': `${siteUrl}/stories`
    }
  ];

  // Add category if available
  if (story.category) {
    // Get category information from our standardized categories
    const categorySlug = story.category.toLowerCase().replace(/\s+/g, '-');
    const categoryInfo = getCategoryBySlug(categorySlug) || findBestMatchingCategory(story.category);

    if (categoryInfo) {
      // If there's a parent category, add it first
      if (categoryInfo.parent) {
        const parentCategory = getCategoryBySlug(categoryInfo.parent);
        if (parentCategory) {
          breadcrumbItems.push({
            '@type': 'ListItem',
            'position': 3,
            'name': parentCategory.name,
            'item': `${siteUrl}/categories/${parentCategory.slug}`
          });

          // Then add the subcategory
          breadcrumbItems.push({
            '@type': 'ListItem',
            'position': 4,
            'name': categoryInfo.name,
            'item': `${siteUrl}/categories/${categoryInfo.slug}`
          });

          // Add story as the final item
          breadcrumbItems.push({
            '@type': 'ListItem',
            'position': 5,
            'name': story.title.replace(/^Title: /, ''),
            'item': `${siteUrl}/stories/${story.slug}`
          });
        } else {
          // Just add the category we have
          breadcrumbItems.push({
            '@type': 'ListItem',
            'position': 3,
            'name': categoryInfo.name,
            'item': `${siteUrl}/categories/${categoryInfo.slug}`
          });

          // Add story as the final item
          breadcrumbItems.push({
            '@type': 'ListItem',
            'position': 4,
            'name': story.title.replace(/^Title: /, ''),
            'item': `${siteUrl}/stories/${story.slug}`
          });
        }
      } else {
        // No parent category, just add the category
        breadcrumbItems.push({
          '@type': 'ListItem',
          'position': 3,
          'name': categoryInfo.name,
          'item': `${siteUrl}/categories/${categoryInfo.slug}`
        });

        // Add story as the final item
        breadcrumbItems.push({
          '@type': 'ListItem',
          'position': 4,
          'name': story.title.replace(/^Title: /, ''),
          'item': `${siteUrl}/stories/${story.slug}`
        });
      }
    } else {
      // Fallback to the original category if not found in our standardized list
      breadcrumbItems.push({
        '@type': 'ListItem',
        'position': 3,
        'name': story.category,
        'item': `${siteUrl}/categories/${categorySlug}`
      });

      // Add story as the final item
      breadcrumbItems.push({
        '@type': 'ListItem',
        'position': 4,
        'name': story.title.replace(/^Title: /, ''),
        'item': `${siteUrl}/stories/${story.slug}`
      });
    }
  } else {
    // Add story as the final item (without category)
    breadcrumbItems.push({
      '@type': 'ListItem',
      'position': 3,
      'name': story.title.replace(/^Title: /, ''),
      'item': `${siteUrl}/stories/${story.slug}`
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbItems
  };
}

/**
 * Generate all applicable schema.org structured data for a story
 * @param story - The story to generate schema for
 * @param siteUrl - The base URL of the site
 * @returns Array of JSON-LD schema objects
 */
export function generateAllSchemas(story: Story, siteUrl: string = 'https://www.globaltravelreport.com'): any[] {
  const schemas = [
    generateNewsArticleSchema(story, siteUrl), // Use NewsArticle as primary schema
    generateArticleSchema(story, siteUrl),     // Also include Article for broader compatibility
    generateBreadcrumbSchema(story, siteUrl)
  ];

  // Add TravelDestination schema if applicable
  const travelDestinationSchema = generateTravelDestinationSchema(story, siteUrl);
  if (travelDestinationSchema) {
    schemas.push(travelDestinationSchema);
  }

  // Add FAQ schema if applicable
  const faqSchema = generateFAQSchema(story, siteUrl);
  if (faqSchema) {
    schemas.push(faqSchema);
  }

  return schemas;
}
