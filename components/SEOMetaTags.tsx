import Head from 'next/head';
import { useRouter } from 'next/router';

interface SEOMetaTagsProps {
  title: string;
  description: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
  canonicalUrl?: string;
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

/**
 * Component for enhanced SEO meta tags
 * @param props - Component props
 * @returns Head component with meta tags
 */
export default function SEOMetaTags({
  title,
  description,
  ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  canonicalUrl,
  keywords,
  author = 'Global Travel Report Editorial Team',
  publishedTime,
  modifiedTime,
}: SEOMetaTagsProps) {
  const router = useRouter();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.globaltravelreport.com';
  const currentUrl = canonicalUrl || `${siteUrl}${router.asPath}`;
  const defaultImage = `${siteUrl}/images/og-image.jpg`;
  const imageUrl = ogImage || defaultImage;
  
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      <link rel="canonical" href={currentUrl} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content="Global Travel Report" />
      <meta property="og:locale" content="en_AU" />
      
      {/* Article-specific Open Graph Tags */}
      {ogType === 'article' && (
        <>
          <meta property="article:author" content={author} />
          <meta property="article:publisher" content={siteUrl} />
          {publishedTime && (
            <meta property="article:published_time" content={publishedTime} />
          )}
          {modifiedTime && (
            <meta property="article:modified_time" content={modifiedTime} />
          )}
          {keywords && keywords.length > 0 && keywords.map((keyword, index) => (
            <meta key={index} property="article:tag" content={keyword} />
          ))}
        </>
      )}
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content="@GTravelReport" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      
      {/* Additional Meta Tags */}
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
  );
}
