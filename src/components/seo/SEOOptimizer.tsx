'use client';

import { useEffect, useState } from 'react';
import Head from 'next/head';

interface SEOData {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product' | 'profile';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
  nofollow?: boolean;
}

interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

interface SEOOptimizerProps {
  data: SEOData;
  structuredData?: StructuredData[];
  children?: React.ReactNode;
  jsonLd?: boolean;
}

export function SEOOptimizer({
  data,
  structuredData = [],
  children,
  jsonLd = true,
}: SEOOptimizerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Update document title
    if (data.title) {
      document.title = data.title;
    }

    // Update meta description
    updateMetaTag('name', 'description', data.description);

    // Update canonical URL
    if (data.canonical) {
      updateMetaTag('property', 'og:url', data.canonical);
      const canonicalLink = document.querySelector('link[rel="canonical"]') || document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('href', data.canonical);
      document.head.appendChild(canonicalLink);
    }

    // Update Open Graph tags
    updateMetaTag('property', 'og:title', data.title);
    updateMetaTag('property', 'og:description', data.description);
    updateMetaTag('property', 'og:image', data.ogImage || '/images/og-image.jpg');
    updateMetaTag('property', 'og:type', data.ogType || 'website');

    // Update Twitter Card tags
    updateMetaTag('name', 'twitter:card', data.twitterCard || 'summary_large_image');
    updateMetaTag('name', 'twitter:title', data.title);
    updateMetaTag('name', 'twitter:description', data.description);
    updateMetaTag('name', 'twitter:image', data.ogImage || '/images/og-image.jpg');

    // Update keywords
    if (data.keywords && data.keywords.length > 0) {
      updateMetaTag('name', 'keywords', data.keywords.join(', '));
    }

    // Update author
    if (data.author) {
      updateMetaTag('name', 'author', data.author);
    }

    // Update article metadata
    if (data.ogType === 'article') {
      if (data.publishedTime) {
        updateMetaTag('property', 'article:published_time', data.publishedTime);
      }
      if (data.modifiedTime) {
        updateMetaTag('property', 'article:modified_time', data.modifiedTime);
      }
      if (data.author) {
        updateMetaTag('property', 'article:author', data.author);
      }
      if (data.section) {
        updateMetaTag('property', 'article:section', data.section);
      }
      if (data.tags && data.tags.length > 0) {
        data.tags.forEach((tag, index) => {
          updateMetaTag('property', `article:tag:${index + 1}`, tag);
        });
      }
    }

    // Handle robots meta
    const robotsContent = [
      data.noindex ? 'noindex' : 'index',
      data.nofollow ? 'nofollow' : 'follow',
    ].join(', ');

    updateMetaTag('name', 'robots', robotsContent);

    // Add structured data
    if (jsonLd && structuredData.length > 0) {
      addStructuredData(structuredData);
    }

    // Cleanup function
    return () => {
      // Remove any dynamically added elements if needed
    };
  }, [data, structuredData, jsonLd]);

  const updateMetaTag = (attribute: string, property: string, content: string) => {
    if (!content) return;

    let element = document.querySelector(`meta[${attribute}="${property}"]`);

    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, property);
      document.head.appendChild(element);
    }

    element.setAttribute('content', content);
  };

  const addStructuredData = (data: StructuredData[]) => {
    // Remove existing structured data
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => script.remove());

    // Add new structured data
    data.forEach(item => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(item);
      document.head.appendChild(script);
    });
  };

  // Generate default structured data based on SEO data
  const generateDefaultStructuredData = (): StructuredData[] => {
    const baseData: StructuredData = {
      '@context': 'https://schema.org',
      '@type': data.ogType === 'article' ? 'Article' : 'WebPage',
      name: data.title,
      description: data.description,
      url: data.canonical,
    };

    if (data.ogImage) {
      baseData.image = data.ogImage;
    }

    if (data.ogType === 'article') {
      (baseData as any).datePublished = data.publishedTime;
      (baseData as any).dateModified = data.modifiedTime || data.publishedTime;
      if (data.author) {
        (baseData as any).author = {
          '@type': 'Person',
          name: data.author,
        };
      }
    }

    return [baseData];
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Next.js Head component for SSR */}
      <Head>
        <title>{data.title}</title>
        <meta name="description" content={data.description} />
        {data.canonical && <link rel="canonical" href={data.canonical} />}
        <meta property="og:title" content={data.title} />
        <meta property="og:description" content={data.description} />
        <meta property="og:image" content={data.ogImage || '/images/og-image.jpg'} />
        <meta property="og:type" content={data.ogType || 'website'} />
        <meta name="twitter:card" content={data.twitterCard || 'summary_large_image'} />
        <meta name="twitter:title" content={data.title} />
        <meta name="twitter:description" content={data.description} />
        <meta name="twitter:image" content={data.ogImage || '/images/og-image.jpg'} />
        {data.keywords && data.keywords.length > 0 && (
          <meta name="keywords" content={data.keywords.join(', ')} />
        )}
        {data.author && <meta name="author" content={data.author} />}
        {data.noindex && <meta name="robots" content="noindex, nofollow" />}
      </Head>

      {/* Client-side structured data */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateDefaultStructuredData()[0]),
          }}
        />
      )}

      {children}
    </>
  );
}

// SEO Analysis Hook
interface SEOAnalysis {
  score: number;
  issues: string[];
  suggestions: string[];
  metrics: {
    titleLength: number;
    descriptionLength: number;
    hasKeywords: boolean;
    hasStructuredData: boolean;
    hasCanonical: boolean;
    hasOgImage: boolean;
    mobileFriendly: boolean;
  };
}

export function useSEOAnalysis(data: SEOData): SEOAnalysis {
  const [analysis, setAnalysis] = useState<SEOAnalysis>({
    score: 0,
    issues: [],
    suggestions: [],
    metrics: {
      titleLength: 0,
      descriptionLength: 0,
      hasKeywords: false,
      hasStructuredData: false,
      hasCanonical: false,
      hasOgImage: false,
      mobileFriendly: true,
    },
  });

  useEffect(() => {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Title analysis
    const titleLength = data.title?.length || 0;
    if (titleLength < 30) {
      issues.push('Title is too short (under 30 characters)');
      score -= 15;
    } else if (titleLength > 60) {
      issues.push('Title is too long (over 60 characters)');
      score -= 10;
    }

    // Description analysis
    const descriptionLength = data.description?.length || 0;
    if (descriptionLength < 120) {
      issues.push('Description is too short (under 120 characters)');
      score -= 15;
    } else if (descriptionLength > 160) {
      issues.push('Description is too long (over 160 characters)');
      score -= 10;
    }

    // Keywords analysis
    const hasKeywords = data.keywords && data.keywords.length > 0;
    if (!hasKeywords) {
      suggestions.push('Add relevant keywords to improve SEO');
      score -= 5;
    }

    // Technical SEO checks
    if (!data.canonical) {
      suggestions.push('Add canonical URL to prevent duplicate content issues');
      score -= 5;
    }

    if (!data.ogImage) {
      suggestions.push('Add Open Graph image for better social media sharing');
      score -= 5;
    }

    // Content quality suggestions
    if (data.ogType === 'article') {
      if (!data.publishedTime) {
        suggestions.push('Add publication date for article schema');
      }
      if (!data.author) {
        suggestions.push('Add author information for better credibility');
      }
    }

    setAnalysis({
      score: Math.max(0, score),
      issues,
      suggestions,
      metrics: {
        titleLength,
        descriptionLength,
        hasKeywords,
        hasStructuredData: true, // We generate structured data
        hasCanonical: !!data.canonical,
        hasOgImage: !!data.ogImage,
        mobileFriendly: true,
      },
    });
  }, [data]);

  return analysis;
}

// SEO Score Display Component
interface SEOScoreProps {
  analysis: SEOAnalysis;
  showDetails?: boolean;
  className?: string;
}

export function SEOScore({ analysis, showDetails = false, className = '' }: SEOScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className={`p-4 border rounded-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">SEO Score</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(analysis.score)} ${getScoreColor(analysis.score)}`}>
          {analysis.score}/100
        </div>
      </div>

      {showDetails && (
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Issues Found</h4>
            {analysis.issues.length > 0 ? (
              <ul className="space-y-1">
                {analysis.issues.map((issue, index) => (
                  <li key={index} className="text-sm text-red-600 flex items-start">
                    <span className="mr-2">•</span>
                    {issue}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-green-600">No issues found!</p>
            )}
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Suggestions</h4>
            {analysis.suggestions.length > 0 ? (
              <ul className="space-y-1">
                {analysis.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-blue-600 flex items-start">
                    <span className="mr-2">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-green-600">No suggestions needed!</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t">
            <div>
              <span className="text-sm text-gray-600">Title Length</span>
              <p className="font-medium">{analysis.metrics.titleLength} characters</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Description Length</span>
              <p className="font-medium">{analysis.metrics.descriptionLength} characters</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Keywords</span>
              <p className="font-medium">{analysis.metrics.hasKeywords ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Canonical URL</span>
              <p className="font-medium">{analysis.metrics.hasCanonical ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}