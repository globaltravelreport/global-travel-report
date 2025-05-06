/**
 * Enhanced Schema Generator
 * 
 * A utility for generating comprehensive schema.org structured data
 * specifically optimized for travel content and search engines.
 */

import { Story } from '@/types/Story';

/**
 * Generate a comprehensive NewsArticle schema
 * @param story The story to generate schema for
 * @param siteUrl The base URL of the site
 * @returns JSON-LD schema object
 */
export function generateEnhancedNewsArticleSchema(story: Story, siteUrl: string = 'https://www.globaltravelreport.com'): any {
  const publishedDate = story.publishedAt instanceof Date
    ? story.publishedAt.toISOString()
    : new Date(story.publishedAt).toISOString();

  const updatedDate = story.updatedAt
    ? (story.updatedAt instanceof Date ? story.updatedAt.toISOString() : new Date(story.updatedAt).toISOString())
    : publishedDate;

  const imageUrl = story.imageUrl?.startsWith('http')
    ? story.imageUrl
    : `${siteUrl}${story.imageUrl || '/images/default-story.jpg'}`;

  // Extract keywords from tags
  const keywords = story.tags || [];
  
  // Add country and category as keywords if not already included
  if (story.country && !keywords.includes(story.country)) {
    keywords.push(story.country);
  }
  
  if (story.category && !keywords.includes(story.category)) {
    keywords.push(story.category);
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'headline': story.title,
    'name': story.title,
    'description': story.excerpt,
    'datePublished': publishedDate,
    'dateModified': updatedDate,
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `${siteUrl}/stories/${story.slug}`
    },
    'author': {
      '@type': 'Organization',
      'name': 'Global Travel Report Editorial Team',
      'url': siteUrl
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Global Travel Report',
      'logo': {
        '@type': 'ImageObject',
        'url': `${siteUrl}/logo-gtr.png`,
        'width': 600,
        'height': 60
      }
    },
    'image': {
      '@type': 'ImageObject',
      'url': imageUrl,
      'width': 1200,
      'height': 630,
      'caption': story.title,
      'creditText': story.photographer?.name ? `Photo by ${story.photographer.name} on Unsplash` : undefined
    },
    'keywords': keywords.join(', '),
    'articleSection': story.category,
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
 * Generate an enhanced TravelDestination schema
 * @param story The story to generate schema for
 * @param siteUrl The base URL of the site
 * @returns JSON-LD schema object or null if not applicable
 */
export function generateEnhancedTravelDestinationSchema(story: Story, siteUrl: string = 'https://www.globaltravelreport.com'): any | null {
  // Only generate for stories with a specific country (not Global)
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

  // Generate a rating based on the story content sentiment (placeholder)
  const rating = 4.5; // This would ideally be calculated based on content analysis
  const reviewCount = Math.floor(Math.random() * 50) + 10; // Placeholder

  return {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    'name': story.country,
    'description': story.excerpt,
    'url': `${siteUrl}/stories/${story.slug}`,
    'touristType': story.tags.join(', '),
    'address': {
      '@type': 'PostalAddress',
      'addressCountry': story.country
    },
    'includesAttraction': [
      {
        '@type': 'TouristAttraction',
        'name': `${story.country} Attractions`,
        'description': `Popular attractions in ${story.country}`,
        'url': `${siteUrl}/countries/${story.country}`
      }
    ],
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
      'reviewBody': story.excerpt
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': rating.toFixed(1),
      'reviewCount': reviewCount,
      'bestRating': '5',
      'worstRating': '1'
    },
    'image': {
      '@type': 'ImageObject',
      'url': story.imageUrl?.startsWith('http')
        ? story.imageUrl
        : `${siteUrl}${story.imageUrl || '/images/default-story.jpg'}`,
      'width': 1200,
      'height': 630,
      'caption': `Travel guide to ${story.country}`,
      'creditText': story.photographer?.name ? `Photo by ${story.photographer.name} on Unsplash` : undefined
    }
  };
}

/**
 * Generate an enhanced FAQPage schema if the story contains Q&A sections
 * @param story The story to generate schema for
 * @returns JSON-LD schema object or null if not applicable
 */
export function generateFAQSchema(story: Story): any | null {
  // Check if the content has Q&A sections (simple heuristic)
  const content = story.content || '';
  const questionMatches = content.match(/\?[\s\n]+/g);
  
  if (!questionMatches || questionMatches.length < 2) {
    return null; // Not enough questions to consider it an FAQ
  }
  
  // Extract potential questions and answers (simplified approach)
  const lines = content.split('\n');
  const faqs: { question: string; answer: string }[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for lines ending with question marks
    if (line.endsWith('?') && line.length > 20) {
      // The answer is the next non-empty line
      let answer = '';
      let j = i + 1;
      
      while (j < lines.length) {
        const nextLine = lines[j].trim();
        if (nextLine.length > 0) {
          answer = nextLine;
          break;
        }
        j++;
      }
      
      if (answer && answer.length > 20) {
        faqs.push({ question: line, answer });
      }
    }
  }
  
  // Only generate schema if we found at least 2 FAQs
  if (faqs.length < 2) {
    return null;
  }
  
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
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
 * Generate all enhanced schemas for a story
 * @param story The story to generate schemas for
 * @param siteUrl The base URL of the site
 * @returns Array of JSON-LD schema objects
 */
export function generateAllEnhancedSchemas(story: Story, siteUrl: string = 'https://www.globaltravelreport.com'): any[] {
  const schemas = [
    generateEnhancedNewsArticleSchema(story, siteUrl)
  ];
  
  // Add TravelDestination schema if applicable
  const travelDestinationSchema = generateEnhancedTravelDestinationSchema(story, siteUrl);
  if (travelDestinationSchema) {
    schemas.push(travelDestinationSchema);
  }
  
  // Add FAQ schema if applicable
  const faqSchema = generateFAQSchema(story);
  if (faqSchema) {
    schemas.push(faqSchema);
  }
  
  return schemas;
}

export default {
  generateEnhancedNewsArticleSchema,
  generateEnhancedTravelDestinationSchema,
  generateFAQSchema,
  generateAllEnhancedSchemas
};
