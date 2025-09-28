/**
 * Enhanced Story Schema Component
 *
 * Generates comprehensive JSON-LD structured data for stories
 * including author, dates, images, keywords, and related content.
 */

import React from 'react';
import Head from 'next/head';
import { Story } from '@/types/Story';

interface EnhancedStorySchemaProps {
  story: Story;
  relatedStories?: Story[];
  className?: string;
}

export function EnhancedStorySchema({
  story,
  relatedStories = [],
  className = ''
}: EnhancedStorySchemaProps) {
  // Generate comprehensive structured data
  const storyStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': story.title,
    'description': story.excerpt,
    'image': [story.imageUrl],
    'datePublished': story.publishedAt,
    'dateModified': story.publishedAt, // Could be enhanced with actual modification date
    'author': {
      '@type': 'Person',
      'name': story.author,
      'url': `https://globaltravelreport.com/author/${encodeURIComponent(story.author.toLowerCase().replace(/\s+/g, '-'))}`
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Global Travel Report',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://globaltravelreport.com/logo.png',
        'width': 400,
        'height': 60
      }
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `https://globaltravelreport.com/stories/${story.slug}`
    },
    'articleSection': story.category,
    'keywords': story.tags?.join(', '),
    'wordCount': story.content?.split(' ').length || 0,
    'timeRequired': `PT${Math.max(2, Math.ceil((story.content?.split(' ').length || 0) / 200))}M`, // Reading time
    'inLanguage': 'en-US',
    'isPartOf': {
      '@type': 'Blog',
      'name': 'Global Travel Report',
      'url': 'https://globaltravelreport.com'
    },
    // Travel-specific properties
    'about': [
      {
        '@type': 'Place',
        'name': story.country,
        'addressCountry': story.country
      },
      {
        '@type': 'Thing',
        'name': story.category,
        'description': `Travel content about ${story.category.toLowerCase()}`
      }
    ],
    // Engagement metrics (if available)
    ...(story.featured && {
      'specialty': 'Featured Story'
    }),
    ...(story.editorsPick && {
      'award': 'Editor\'s Pick'
    })
  };

  // Add breadcrumb navigation
  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://globaltravelreport.com'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': story.category,
        'item': `https://globaltravelreport.com/categories/${story.category.toLowerCase()}`
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': story.title,
        'item': `https://globaltravelreport.com/stories/${story.slug}`
      }
    ]
  };

  // Add related stories if available
  const relatedArticlesData = relatedStories.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'Related Travel Stories',
    'itemListElement': relatedStories.slice(0, 5).map((relatedStory, index) => ({
      '@type': 'Article',
      'position': index + 1,
      'headline': relatedStory.title,
      'url': `https://globaltravelreport.com/stories/${relatedStory.slug}`,
      'image': relatedStory.imageUrl,
      'datePublished': relatedStory.publishedAt,
      'author': {
        '@type': 'Person',
        'name': relatedStory.author
      }
    }))
  } : null;

  return (
    <>
      {/* Primary Story Schema */}
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(storyStructuredData, null, 0)
          }}
        />
      </Head>

      {/* Breadcrumb Schema */}
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbStructuredData, null, 0)
          }}
        />
      </Head>

      {/* Related Articles Schema */}
      {relatedArticlesData && (
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(relatedArticlesData, null, 0)
            }}
          />
        </Head>
      )}

      {/* Enhanced Meta Tags */}
      <Head>
        <meta name="author" content={story.author} />
        <meta name="publish_date" content={story.publishedAt?.toString()} />
        <meta name="category" content={story.category} />
        <meta name="country" content={story.country} />
        {story.tags?.map(tag => (
          <meta key={tag} name="keywords" content={tag} />
        ))}

        {/* Open Graph enhanced tags */}
        <meta property="og:type" content="article" />
        <meta property="og:author" content={story.author} />
        <meta property="article:published_time" content={story.publishedAt?.toString()} />
        <meta property="article:section" content={story.category} />
        {story.tags?.map(tag => (
          <meta key={`og-tag-${tag}`} property="article:tag" content={tag} />
        ))}

        {/* Twitter Card enhanced tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@globaltravelrpt" />
      </Head>

      {/* Display component (optional visual enhancement) */}
      <div className={`enhanced-story-schema ${className}`}>
        {/* Reading time and metadata display */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {Math.max(2, Math.ceil((story.content?.split(' ').length || 0) / 200))} min read
          </span>

          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {story.country}
          </span>

          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {story.category}
          </span>

          {story.featured && (
            <span className="flex items-center gap-1 text-blue-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Featured
            </span>
          )}
        </div>

        {/* Tags */}
        {story.tags && story.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {story.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/**
 * Hook for generating story metadata
 */
export function useStoryMetadata(story: Story) {
  const readingTime = React.useMemo(() => {
    const wordCount = story.content?.split(' ').length || 0;
    return Math.max(1, Math.ceil(wordCount / 200)); // Assume 200 words per minute
  }, [story.content]);

  const publishedDate = React.useMemo(() => {
    return new Date(story.publishedAt || '').toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [story.publishedAt]);

  const structuredData = React.useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': story.title,
      'description': story.excerpt,
      'image': story.imageUrl,
      'datePublished': story.publishedAt,
      'author': {
        '@type': 'Person',
        'name': story.author
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'Global Travel Report'
      },
      'articleSection': story.category,
      'keywords': story.tags?.join(', ')
    };
  }, [story]);

  return {
    readingTime,
    publishedDate,
    structuredData,
    metaTitle: story.metaTitle || story.title,
    metaDescription: story.metaDescription || story.excerpt
  };
}

export default EnhancedStorySchema;