import React from 'react';
import Head from 'next/head';
import { usePathname } from 'next/navigation';

interface EnhancedSEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  ogImageAlt?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterSite?: string;
  twitterCreator?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  noIndex?: boolean;
  noFollow?: boolean;
  alternateLanguages?: {
    hrefLang: string;
    href: string;
  }[];
  children?: React.ReactNode;
}

/**
 * Enhanced SEO component for better meta tags
 */
export function EnhancedSEO({
  title,
  description,
  canonical,
  ogType = 'website',
  ogImage,
  ogImageAlt,
  ogImageWidth,
  ogImageHeight,
  twitterCard = 'summary_large_image',
  twitterSite = '@globaltravelreport',
  twitterCreator,
  publishedTime,
  modifiedTime,
  author,
  section,
  tags,
  noIndex = false,
  noFollow = false,
  alternateLanguages,
  children
}: EnhancedSEOProps) {
  const pathname = usePathname();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com';
  
  // Generate canonical URL if not provided
  const canonicalUrl = canonical || `${baseUrl}${pathname}`;
  
  // Generate robots meta tag
  const robotsContent = [];
  if (noIndex) robotsContent.push('noindex');
  if (noFollow) robotsContent.push('nofollow');
  const robotsMeta = robotsContent.length > 0 ? robotsContent.join(', ') : 'index, follow';
  
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="Global Travel Report" />
      
      {ogImage && (
        <>
          <meta property="og:image" content={ogImage} />
          {ogImageAlt && <meta property="og:image:alt" content={ogImageAlt} />}
          {ogImageWidth && <meta property="og:image:width" content={ogImageWidth.toString()} />}
          {ogImageHeight && <meta property="og:image:height" content={ogImageHeight.toString()} />}
        </>
      )}
      
      {/* Twitter Card tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content={twitterSite} />
      {twitterCreator && <meta name="twitter:creator" content={twitterCreator} />}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      {ogImageAlt && <meta name="twitter:image:alt" content={ogImageAlt} />}
      
      {/* Article specific tags */}
      {ogType === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {tags && tags.map((tag, index) => (
            <meta key={`tag-${index}`} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Robots meta tag */}
      <meta name="robots" content={robotsMeta} />
      
      {/* Alternate language links */}
      {alternateLanguages && alternateLanguages.map((lang) => (
        <link
          key={lang.hrefLang}
          rel="alternate"
          hrefLang={lang.hrefLang}
          href={lang.href}
        />
      ))}
      
      {/* Additional meta tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="theme-color" content="#19273A" />
      
      {/* Additional children */}
      {children}
    </>
  );
}
