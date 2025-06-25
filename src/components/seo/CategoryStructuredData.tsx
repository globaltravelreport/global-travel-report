import React from 'react';
import { StructuredData } from '@/components/seo/StructuredData';
import { Category } from '@/src/config/categories';

interface CategoryStructuredDataProps {
  /**
   * The category to generate structured data for
   */
  category: Category;

  /**
   * Subcategories of the main category (if any)
   */
  subcategories?: Category[];

  /**
   * The number of stories in this category
   */
  storyCount?: number;

  /**
   * The base URL of the site
   */
  siteUrl?: string;
}

/**
 * Component for adding structured data for category pages
 *
 * This component generates:
 * 1. CollectionPage schema for the category
 * 2. BreadcrumbList schema for navigation
 * 3. ItemList schema for subcategories (if any)
 */
export function CategoryStructuredData({
  category,
  subcategories = [],
  storyCount = 0,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.globaltravelreport.com'
}: CategoryStructuredDataProps) {
  // Generate CollectionPage schema
  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': `${category.name} - Global Travel Report`,
    'description': category.description,
    'url': `${siteUrl}/categories/${category.slug}`,
    'mainEntity': {
      '@type': 'ItemList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'url': `${siteUrl}/categories/${category.slug}`,
          'name': category.name,
          'description': category.description
        }
      ],
      'numberOfItems': storyCount > 0 ? storyCount : 1
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
    }
  };

  // Generate BreadcrumbList schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': siteUrl
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Categories',
        'item': `${siteUrl}/categories`
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': category.name,
        'item': `${siteUrl}/categories/${category.slug}`
      }
    ]
  };

  // Generate ItemList schema for subcategories if any
  const subcategorySchema = subcategories.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': `${category.name} Subcategories`,
    'description': `Explore subcategories of ${category.name}`,
    'url': `${siteUrl}/categories/${category.slug}`,
    'mainEntity': {
      '@type': 'ItemList',
      'itemListElement': subcategories.map((subcat, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'url': `${siteUrl}/categories/${subcat.slug}`,
        'name': subcat.name,
        'description': subcat.description
      })),
      'numberOfItems': subcategories.length
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
    }
  } : null;

  // Combine all schemas
  const schemas = [
    collectionPageSchema,
    breadcrumbSchema
  ];

  // Add subcategory schema if applicable
  if (subcategorySchema) {
    schemas.push(subcategorySchema);
  }

  return (
    <>
      {schemas.map((schema, index) => (
        <StructuredData
          key={`category-schema-${index}`}
          data={schema}
          id={`category-schema-${index}`}
        />
      ))}
    </>
  );
}

export default CategoryStructuredData;
