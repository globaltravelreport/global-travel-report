
'use client';

import Head from 'next/head';
import { usePathname } from 'next/navigation';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
  noIndex?: boolean;
  canonicalUrl?: string;
}

export function SEOHead({
  title = 'Global Travel Report - Your Ultimate Travel Companion',
  description = 'Discover amazing travel destinations, insider tips, and inspiring stories from around the world. Your ultimate guide to unforgettable adventures.',
  keywords = ['travel', 'destinations', 'travel tips', 'travel guide', 'adventure', 'vacation'],
  image = '/images/og-default.jpg',
  article,
  noIndex = false,
  canonicalUrl,
}: SEOHeadProps) {
  const pathname = usePathname();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://globaltravelreport.com';
  const fullUrl = `${baseUrl}${pathname}`;
  const canonical = canonicalUrl || fullUrl;
  const ogImage = image.startsWith('http') ? image : `${baseUrl}${image}`;

  // Generate structured data for organization
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Global Travel Report',
    url: baseUrl,
    logo: `${baseUrl}/images/logo.png`,
    description: 'Your ultimate travel companion for discovering amazing destinations and travel tips.',
    sameAs: [
      'https://twitter.com/globaltravelreport',
      'https://facebook.com/globaltravelreport',
      'https://instagram.com/globaltravelreport',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-555-0123',
      contactType: 'customer service',
      availableLanguage: 'English'
    }
  };

  // Generate structured data for website
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Global Travel Report',
    url: baseUrl,
    description: description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  // Generate breadcrumb structured data
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl
      }
    ]
  };

  // Add breadcrumb items based on pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  pathSegments.forEach((segment, index) => {
    const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    const url = `${baseUrl}/${pathSegments.slice(0, index + 1).join('/')}`;
    
    breadcrumbSchema.itemListElement.push({
      '@type': 'ListItem',
      position: index + 2,
      name,
      item: url
    });
  });

  // Generate article structured data if article props are provided
  const articleSchema = article ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: ogImage,
    author: {
      '@type': 'Person',
      name: article.author || 'Global Travel Report Team'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Global Travel Report',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/logo.png`
      }
    },
    datePublished: article.publishedTime,
    dateModified: article.modifiedTime || article.publishedTime,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonical
    },
    articleSection: article.section,
    keywords: article.tags?.join(', ')
  } : null;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content="Global Travel Report" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />

      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />

      {/* Open Graph Tags */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content="Global Travel Report" />
      <meta property="og:locale" content="en_US" />

      {/* Article-specific Open Graph tags */}
      {article && (
        <>
          <meta property="article:published_time" content={article.publishedTime} />
          <meta property="article:modified_time" content={article.modifiedTime || article.publishedTime} />
          <meta property="article:author" content={article.author || 'Global Travel Report Team'} />
          <meta property="article:section" content={article.section} />
          {article.tags?.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@globaltravelreport" />
      <meta name="twitter:creator" content="@globaltravelreport" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={title} />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#19273A" />
      <meta name="msapplication-TileColor" content="#19273A" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Global Travel Report" />

      {/* Favicon and Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />
      {articleSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(articleSchema)
          }}
        />
      )}

      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://images.unsplash.com" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
    </Head>
  );
}

export default SEOHead;
