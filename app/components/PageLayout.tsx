'use client';

import { ReactNode } from 'react';
import Head from 'next/head';
import Hero from './Hero';
import { heroImages } from '../config/images';
import { usePathname } from 'next/navigation';

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  heroType?: keyof typeof heroImages;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  schemaType?: 'Article' | 'WebPage' | 'Organization';
  schemaData?: Record<string, any>;
}

export default function PageLayout({ 
  children, 
  title, 
  description, 
  heroType = 'home',
  ogImage,
  ogTitle,
  ogDescription,
  schemaType = 'WebPage',
  schemaData = {}
}: PageLayoutProps) {
  const pathname = usePathname();
  const imageConfig = heroImages[heroType] || heroImages.home;
  const siteTitle = 'Global Travel Report';
  const fullTitle = `${title} | ${siteTitle}`;
  const fullDescription = description || 'Your trusted source for travel news, reviews, tips and exclusive deals.';
  const imageUrl = ogImage || imageConfig.url;
  const canonicalUrl = `https://www.globaltravelreport.com${pathname}`;

  // Base schema data
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: fullTitle,
    description: fullDescription,
    url: canonicalUrl,
    image: imageUrl,
    publisher: {
      '@type': 'Organization',
      name: siteTitle,
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.globaltravelreport.com/images/logo.png'
      }
    }
  };

  // Merge base schema with custom schema data
  const finalSchema = {
    ...baseSchema,
    ...schemaData
  };

  return (
    <>
      <Head>
        <title>{fullTitle}</title>
        <meta name="description" content={fullDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content={ogTitle || fullTitle} />
        <meta property="og:description" content={ogDescription || fullDescription} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={siteTitle} />
        <meta property="og:url" content={canonicalUrl} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle || fullTitle} />
        <meta name="twitter:description" content={ogDescription || fullDescription} />
        <meta name="twitter:image" content={imageUrl} />
        <meta name="twitter:site" content="@globaltravelreport" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(finalSchema) }}
        />
      </Head>
      
      <main>
        <Hero 
          title={title} 
          description={description} 
          heroType={heroType}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {children}
        </div>
      </main>
    </>
  );
} 