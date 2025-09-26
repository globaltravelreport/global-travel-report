'use client';

import { useEffect } from 'react';

interface BaseMetaProps {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: 'website' | 'article' | 'profile' | 'book' | 'video' | 'music.song' | 'product';
  siteName?: string;
  locale?: string;
}

interface ArticleMetaProps extends BaseMetaProps {
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

interface ProfileMetaProps extends BaseMetaProps {
  firstName?: string;
  lastName?: string;
  username?: string;
  gender?: 'male' | 'female';
}

interface BookMetaProps extends BaseMetaProps {
  author: string;
  isbn?: string;
  releaseDate?: string;
  tags?: string[];
}

interface VideoMetaProps extends BaseMetaProps {
  duration?: number;
  releaseDate?: string;
  tags?: string[];
}

interface MusicSongMetaProps extends BaseMetaProps {
  duration?: number;
  musician: string;
  album?: string;
  releaseDate?: string;
}

interface ProductMetaProps extends BaseMetaProps {
  price?: string;
  currency?: string;
  availability?: 'in stock' | 'out of stock' | 'preorder' | 'discontinued';
  condition?: 'new' | 'used' | 'refurbished';
  retailer?: string;
}

// Open Graph Meta Tags Component
export function OpenGraphMeta({
  title,
  description,
  image,
  url,
  type = 'website',
  siteName = 'Global Travel Report',
  locale = 'en_US',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags,
  firstName,
  lastName,
  username,
  gender,
  isbn,
  releaseDate,
  duration,
  musician,
  album,
  price,
  currency,
  availability,
  condition,
  retailer,
}: BaseMetaProps & Partial<ArticleMetaProps & ProfileMetaProps & BookMetaProps & VideoMetaProps & MusicSongMetaProps & ProductMetaProps>) {
  const metaTags = [
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: image },
    { property: 'og:url', content: url },
    { property: 'og:type', content: type },
    { property: 'og:site_name', content: siteName },
    { property: 'og:locale', content: locale },
  ];

  // Add type-specific meta tags
  if (type === 'article' && (publishedTime || author || section)) {
    if (publishedTime) metaTags.push({ property: 'article:published_time', content: publishedTime });
    if (modifiedTime) metaTags.push({ property: 'article:modified_time', content: modifiedTime });
    if (author) metaTags.push({ property: 'article:author', content: author });
    if (section) metaTags.push({ property: 'article:section', content: section });
    if (tags) tags.forEach(tag => metaTags.push({ property: 'article:tag', content: tag }));
  }

  if (type === 'profile' && (firstName || lastName || username || gender)) {
    if (firstName) metaTags.push({ property: 'profile:first_name', content: firstName });
    if (lastName) metaTags.push({ property: 'profile:last_name', content: lastName });
    if (username) metaTags.push({ property: 'profile:username', content: username });
    if (gender) metaTags.push({ property: 'profile:gender', content: gender });
  }

  if (type === 'book' && (author || isbn || releaseDate)) {
    metaTags.push({ property: 'book:author', content: author });
    if (isbn) metaTags.push({ property: 'book:isbn', content: isbn });
    if (releaseDate) metaTags.push({ property: 'book:release_date', content: releaseDate });
    if (tags) tags.forEach(tag => metaTags.push({ property: 'book:tag', content: tag }));
  }

  if (type === 'video' && (duration || releaseDate)) {
    if (duration) metaTags.push({ property: 'video:duration', content: duration.toString() });
    if (releaseDate) metaTags.push({ property: 'video:release_date', content: releaseDate });
    if (tags) tags.forEach(tag => metaTags.push({ property: 'video:tag', content: tag }));
  }

  if (type === 'music.song' && (duration || musician || album || releaseDate)) {
    if (duration) metaTags.push({ property: 'music:duration', content: duration.toString() });
    metaTags.push({ property: 'music:musician', content: musician });
    if (album) metaTags.push({ property: 'music:album', content: album });
    if (releaseDate) metaTags.push({ property: 'music:release_date', content: releaseDate });
  }

  if (type === 'product' && (price || availability || condition || retailer)) {
    if (price && currency) metaTags.push({ property: 'product:price:amount', content: price });
    if (currency) metaTags.push({ property: 'product:price:currency', content: currency });
    if (availability) metaTags.push({ property: 'product:availability', content: availability });
    if (condition) metaTags.push({ property: 'product:condition', content: condition });
    if (retailer) metaTags.push({ property: 'product:retailer', content: retailer });
  }

  useEffect(() => {
    // Remove existing Open Graph tags
    const existingTags = document.querySelectorAll('meta[property^="og:"]');
    existingTags.forEach(tag => tag.remove());

    // Add new Open Graph tags
    metaTags.forEach(({ property, content }) => {
      if (content) {
        const meta = document.createElement('meta');
        meta.setAttribute('property', property);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    });

    return () => {
      const tags = document.querySelectorAll('meta[property^="og:"]');
      tags.forEach(tag => tag.remove());
    };
  }, [metaTags]);

  return null;
}

// Twitter Card Meta Tags Component
export function TwitterCardMeta({
  title,
  description,
  image,
  url,
  card = 'summary_large_image',
  site = '@globaltravel',
  creator,
}: {
  title: string;
  description: string;
  image?: string;
  url: string;
  card?: 'summary' | 'summary_large_image' | 'app' | 'player';
  site?: string;
  creator?: string;
}) {
  const metaTags = [
    { name: 'twitter:card', content: card },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image },
    { name: 'twitter:url', content: url },
    { name: 'twitter:site', content: site },
    ...(creator ? [{ name: 'twitter:creator', content: creator }] : []),
  ];

  useEffect(() => {
    // Remove existing Twitter Card tags
    const existingTags = document.querySelectorAll('meta[name^="twitter:"]');
    existingTags.forEach(tag => tag.remove());

    // Add new Twitter Card tags
    metaTags.forEach(({ name, content }) => {
      if (content) {
        const meta = document.createElement('meta');
        meta.setAttribute('name', name);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    });

    return () => {
      const tags = document.querySelectorAll('meta[name^="twitter:"]');
      tags.forEach(tag => tag.remove());
    };
  }, [metaTags]);

  return null;
}

// Combined Social Meta Tags Component
interface SocialMetaTagsProps extends BaseMetaProps {
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterSite?: string;
  twitterCreator?: string;
  // Article-specific props
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  // Profile-specific props
  firstName?: string;
  lastName?: string;
  username?: string;
  gender?: 'male' | 'female';
  // Book-specific props
  isbn?: string;
  releaseDate?: string;
  // Video-specific props
  duration?: number;
  // Music-specific props
  musician?: string;
  album?: string;
  // Product-specific props
  price?: string;
  currency?: string;
  availability?: 'in stock' | 'out of stock' | 'preorder' | 'discontinued';
  condition?: 'new' | 'used' | 'refurbished';
  retailer?: string;
}

export function SocialMetaTags({
  title,
  description,
  image,
  url,
  type = 'website',
  siteName,
  locale,
  twitterCard = 'summary_large_image',
  twitterSite,
  twitterCreator,
  publishedTime,
  modifiedTime,
  author,
  section,
  tags,
  firstName,
  lastName,
  username,
  gender,
  isbn,
  releaseDate,
  duration,
  musician,
  album,
  price,
  currency,
  availability,
  condition,
  retailer,
}: SocialMetaTagsProps) {
  return (
    <>
      <OpenGraphMeta
        title={title}
        description={description}
        image={image}
        url={url}
        type={type}
        siteName={siteName}
        locale={locale}
        publishedTime={publishedTime}
        modifiedTime={modifiedTime}
        author={author}
        section={section}
        tags={tags}
        firstName={firstName}
        lastName={lastName}
        username={username}
        gender={gender}
        isbn={isbn}
        releaseDate={releaseDate}
        duration={duration}
        musician={musician}
        album={album}
        price={price}
        currency={currency}
        availability={availability}
        condition={condition}
        retailer={retailer}
      />
      <TwitterCardMeta
        title={title}
        description={description}
        image={image}
        url={url}
        card={twitterCard}
        site={twitterSite}
        creator={twitterCreator}
      />
    </>
  );
}

// SEO Head Component for Next.js pages
interface SEOHeadProps {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: 'website' | 'article' | 'profile' | 'book' | 'video' | 'music.song' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  canonical?: string;
  noindex?: boolean;
  structuredData?: any;
}

export function SEOHead({
  title,
  description,
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags,
  canonical,
  noindex = false,
  structuredData,
}: SEOHeadProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // Add canonical URL
    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonical);
    }

    // Add robots meta tag
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', noindex ? 'noindex,nofollow' : 'index,follow');

    // Add structured data if provided
    if (structuredData) {
      let structuredDataScript = document.querySelector('script[type="application/ld+json"]');
      if (!structuredDataScript) {
        structuredDataScript = document.createElement('script');
        structuredDataScript.setAttribute('type', 'application/ld+json');
        document.head.appendChild(structuredDataScript);
      }
      structuredDataScript.textContent = JSON.stringify(structuredData);
    }

    return () => {
      // Cleanup function - in a real implementation, you might want to be more selective
      const metaTags = document.querySelectorAll('meta[name="description"], meta[name="robots"]');
      metaTags.forEach(tag => tag.remove());

      const canonicalLinks = document.querySelectorAll('link[rel="canonical"]');
      canonicalLinks.forEach(link => link.remove());

      const structuredDataScripts = document.querySelectorAll('script[type="application/ld+json"]');
      structuredDataScripts.forEach(script => script.remove());
    };
  }, [title, description, canonical, noindex, structuredData]);

  return (
    <SocialMetaTags
      title={title}
      description={description}
      image={image}
      url={url}
      type={type}
      publishedTime={publishedTime}
      modifiedTime={modifiedTime}
      author={author}
      section={section}
      tags={tags}
    />
  );
}

// Utility function to generate structured data for articles
export function generateArticleStructuredData({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  author,
  publisher,
  url,
  mainEntityOfPage,
}: {
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author: { name: string; url?: string };
  publisher: { name: string; logo: string };
  url: string;
  mainEntityOfPage?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    image: image ? [image] : undefined,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: author.name,
      url: author.url,
    },
    publisher: {
      '@type': 'Organization',
      name: publisher.name,
      logo: {
        '@type': 'ImageObject',
        url: publisher.logo,
      },
    },
    mainEntityOfPage: mainEntityOfPage || {
      '@type': 'WebPage',
      '@id': url,
    },
  };
}