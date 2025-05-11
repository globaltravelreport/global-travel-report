import { Story } from '@/types/Story';
import { getCategoryBySlug, findBestMatchingCategory } from '@/src/config/categories';

/**
 * Extracts keywords from story content and tags
 * @param story - The story to extract keywords from
 * @returns Array of keywords
 */
function extractKeywords(story: Story): string[] {
  // Start with the tags
  const keywords = [...(story.tags || [])];

  // Add the category if available
  if (story.category) {
    keywords.push(story.category);
  }

  // Add the country if available
  if (story.country && story.country !== 'Global') {
    keywords.push(story.country);
  }

  // Add travel-related keywords
  keywords.push('travel', 'global travel report', 'travel guide');

  // Return unique keywords
  return Array.from(new Set(keywords));
}

/**
 * Generate NewsArticle schema.org structured data for a story
 * @param story - The story to generate schema for
 * @param siteUrl - The base URL of the site
 * @returns JSON-LD schema object for the story
 */
export function generateNewsArticleSchema(story: Story, siteUrl: string = 'https://www.globaltravelreport.com') {
  const publishedDate = typeof story.publishedAt === 'object'
    ? story.publishedAt.toISOString()
    : new Date(story.publishedAt).toISOString();

  const updatedDate = story.updatedAt
    ? (typeof story.updatedAt === 'object' ? story.updatedAt.toISOString() : new Date(story.updatedAt).toISOString())
    : publishedDate;

  const imageUrl = story.imageUrl?.startsWith('http')
    ? story.imageUrl
    : `${siteUrl}${story.imageUrl || '/images/default-story.jpg'}`;

  // Get category information if available
  const categorySlug = story.category?.toLowerCase().replace(/\s+/g, '-');
  const categoryInfo = categorySlug ? getCategoryBySlug(categorySlug) || findBestMatchingCategory(story.category) : null;

  // Get optimized keywords
  const keywords = extractKeywords(story);

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
    'keywords': keywords.join(', '),
    'articleSection': categoryInfo?.name || story.category,
    'isAccessibleForFree': 'True',
    'speakable': {
      '@type': 'SpeakableSpecification',
      'cssSelector': ['article h1', 'article p']
    },
    'about': [
      {
        '@type': 'Thing',
        'name': story.country || 'Global Travel',
        'description': story.excerpt
      }
    ],
    'wordCount': story.content ? story.content.split(/\s+/).length : undefined,
    'inLanguage': 'en-AU',
    'copyrightYear': new Date(publishedDate).getFullYear(),
    'copyrightHolder': {
      '@type': 'Organization',
      'name': 'Global Travel Report',
      'url': siteUrl
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
  const publishedDate = typeof story.publishedAt === 'object'
    ? story.publishedAt.toISOString()
    : new Date(story.publishedAt).toISOString();

  const updatedDate = story.updatedAt
    ? (typeof story.updatedAt === 'object' ? story.updatedAt.toISOString() : new Date(story.updatedAt).toISOString())
    : publishedDate;

  const imageUrl = story.imageUrl?.startsWith('http')
    ? story.imageUrl
    : `${siteUrl}${story.imageUrl || '/images/default-story.jpg'}`;

  // Get category information if available
  const categorySlug = story.category?.toLowerCase().replace(/\s+/g, '-');
  const categoryInfo = categorySlug ? getCategoryBySlug(categorySlug) || findBestMatchingCategory(story.category) : null;

  // Get optimized keywords
  const keywords = extractKeywords(story);

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
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
    'keywords': keywords.join(', '),
    'articleSection': categoryInfo?.name || story.category,
    'wordCount': story.content ? story.content.split(/\s+/).length : undefined,
    'inLanguage': 'en-AU',
    'isPartOf': {
      '@type': 'WebSite',
      'name': 'Global Travel Report',
      'url': siteUrl
    },
    'about': {
      '@type': 'Thing',
      'name': story.country || 'Global Travel',
      'description': story.excerpt
    }
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

  // Get optimized keywords
  const keywords = extractKeywords(story);

  return {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    'name': story.country,
    'description': story.excerpt,
    'image': [imageUrl],
    'url': `${siteUrl}/stories/${story.slug}`,
    'touristType': keywords.join(', '),
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
        'url': `${siteUrl}/stories/${story.slug}`,
        'image': [imageUrl],
        'isAccessibleForFree': true
      }
    ],
    'availableLanguage': {
      '@type': 'Language',
      'name': 'English'
    },
    'audience': {
      '@type': 'Audience',
      'audienceType': 'Travelers',
      'geographicArea': {
        '@type': 'Country',
        'name': 'Australia'
      }
    },
    'potentialAction': {
      '@type': 'ReadAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `${siteUrl}/stories/${story.slug}`
      }
    }
  };
}

/**
 * Generate FAQPage schema.org structured data if the story contains FAQs
 * @param story - The story to generate schema for
 * @param siteUrl - The base URL of the site
 * @returns JSON-LD schema object for FAQs or null if no FAQs
 */
export function generateFAQSchema(story: Story, _siteUrl: string = 'https://www.globaltravelreport.com') {
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
 * Generate AggregateRating schema for travel destinations
 * @param story - The story to generate schema for
 * @param siteUrl - The base URL of the site
 * @returns JSON-LD schema object for aggregate rating or null if not applicable
 */
export function generateAggregateRatingSchema(story: Story, siteUrl: string = 'https://www.globaltravelreport.com') {
  // Only generate for stories about specific destinations
  if (!story.country || story.country === 'Global') {
    return null;
  }

  // Check if the story is about a destination
  const isDestination =
    story.category?.toLowerCase().includes('destination') ||
    story.tags.some(tag =>
      tag.toLowerCase().includes('destination') ||
      tag.toLowerCase().includes('travel guide') ||
      tag.toLowerCase().includes('vacation') ||
      tag.toLowerCase().includes('holiday')
    );

  if (!isDestination) {
    return null;
  }

  // Generate a consistent rating based on the story slug
  // This ensures the same destination always gets the same rating
  const hash = story.slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rating = (hash % 15 + 40) / 10; // Rating between 4.0 and 5.5
  const reviewCount = hash % 500 + 50; // Between 50 and 549 reviews

  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    'name': 'Global Travel Report',
    'url': siteUrl,
    'review': {
      '@type': 'Review',
      'reviewRating': {
        '@type': 'Rating',
        'ratingValue': rating.toFixed(1),
        'bestRating': '5'
      },
      'author': {
        '@type': 'Organization',
        'name': 'Global Travel Report Editorial Team'
      },
      'datePublished': new Date(story.publishedAt).toISOString(),
      'reviewBody': story.excerpt,
      'itemReviewed': {
        '@type': 'TouristDestination',
        'name': story.country,
        'url': `${siteUrl}/stories/${story.slug}`
      }
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': rating.toFixed(1),
      'reviewCount': reviewCount,
      'bestRating': '5',
      'worstRating': '1'
    }
  };
}

/**
 * Generate all applicable schema.org structured data for a story
 * @param story - The story to generate schema for
 * @param siteUrl - The base URL of the site
 * @returns Array of JSON-LD schema objects
 */
export function generateAllSchemas(story: Story, siteUrl: string = 'https://www.globaltravelreport.com'): Record<string, unknown>[] {
  const schemas = [
    generateNewsArticleSchema(story, siteUrl), // Use NewsArticle as primary schema
    generateArticleSchema(story, siteUrl),     // Also include Article for broader compatibility
    generateBreadcrumbSchema(story, siteUrl)
  ];

  // Add TravelDestination schema if applicable
  const travelDestinationSchema = generateTravelDestinationSchema(story, siteUrl);
  if (travelDestinationSchema) {
    // Ensure it has the required properties for a valid schema
    if (travelDestinationSchema['@type'] === 'TouristDestination') {
      schemas.push(travelDestinationSchema as unknown as any);
    }
  }

  // Add FAQ schema if applicable
  const faqSchema = generateFAQSchema(story, siteUrl);
  if (faqSchema) {
    // Ensure it has the required properties for a valid schema
    if (faqSchema['@type'] === 'FAQPage' && faqSchema.mainEntity) {
      schemas.push(faqSchema as unknown as any);
    }
  }

  // Add AggregateRating schema if applicable
  const aggregateRatingSchema = generateAggregateRatingSchema(story, siteUrl);
  if (aggregateRatingSchema) {
    // Ensure it has the required properties for a valid schema
    if (aggregateRatingSchema['@type'] === 'TravelAgency' && aggregateRatingSchema.aggregateRating) {
      schemas.push(aggregateRatingSchema as unknown as any);
    }
  }

  return schemas;
}
