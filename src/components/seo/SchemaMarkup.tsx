'use client';

import { useEffect } from 'react';

interface BaseSchemaProps {
  url: string;
  name: string;
  description: string;
  image?: string;
}

interface ArticleSchemaProps extends BaseSchemaProps {
  headline: string;
  author: {
    name: string;
    url?: string;
  };
  datePublished: string;
  dateModified?: string;
  publisher: {
    name: string;
    logo: string;
  };
  articleSection?: string;
  keywords?: string[];
}

interface OrganizationSchemaProps {
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs: string[];
  contactPoint?: {
    telephone?: string;
    email?: string;
    contactType: string;
  };
}

interface BreadcrumbSchemaProps {
  items: Array<{
    name: string;
    item: string;
  }>;
}

interface FAQSchemaProps {
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

interface EventSchemaProps extends BaseSchemaProps {
  startDate: string;
  endDate?: string;
  location: {
    name: string;
    address: {
      streetAddress: string;
      addressLocality: string;
      addressRegion: string;
      postalCode: string;
      addressCountry: string;
    };
  };
  offers?: {
    price: string;
    currency: string;
    availability: string;
    url: string;
  };
}

// Article Schema Component
export function ArticleSchema({
  url,
  name,
  description,
  image,
  headline,
  author,
  datePublished,
  dateModified,
  publisher,
  articleSection,
  keywords = [],
}: ArticleSchemaProps) {
  const schema = {
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
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    articleSection,
    keywords: keywords.join(', '),
    url,
    name,
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [schema]);

  return null;
}

// Organization Schema Component
export function OrganizationSchema({
  name,
  url,
  logo,
  description,
  sameAs,
  contactPoint,
}: OrganizationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    description,
    sameAs,
    ...(contactPoint && {
      contactPoint: {
        '@type': 'ContactPoint',
        ...contactPoint,
      },
    }),
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [schema]);

  return null;
}

// Breadcrumb Schema Component
export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [schema]);

  return null;
}

// FAQ Schema Component
export function FAQSchema({ questions }: FAQSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [schema]);

  return null;
}

// Event Schema Component
export function EventSchema({
  url,
  name,
  description,
  image,
  startDate,
  endDate,
  location,
  offers,
}: EventSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name,
    description,
    image: image ? [image] : undefined,
    startDate,
    endDate,
    url,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: location.name,
      address: {
        '@type': 'PostalAddress',
        ...location.address,
      },
    },
    ...(offers && { offers: {
      '@type': 'Offer',
      ...offers,
    }}),
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [schema]);

  return null;
}

// Product Schema Component
interface ProductSchemaProps {
  name: string;
  description: string;
  image: string[];
  brand: string;
  category: string;
  offers: {
    price: string;
    currency: string;
    availability: string;
    url: string;
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
  review?: Array<{
    author: string;
    rating: number;
    reviewBody: string;
    datePublished: string;
  }>;
}

export function ProductSchema({
  name,
  description,
  image,
  brand,
  category,
  offers,
  aggregateRating,
  review,
}: ProductSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    category,
    offers: {
      '@type': 'Offer',
      ...offers,
    },
    ...(aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ...aggregateRating,
      },
    }),
    ...(review && {
      review: review.map(r => ({
        '@type': 'Review',
        ...r,
      })),
    }),
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [schema]);

  return null;
}

// Local Business Schema Component
interface LocalBusinessSchemaProps {
  name: string;
  description: string;
  url: string;
  image?: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  telephone?: string;
  email?: string;
  priceRange?: string;
  openingHours?: string[];
  sameAs?: string[];
}

export function LocalBusinessSchema({
  name,
  description,
  url,
  image,
  address,
  telephone,
  email,
  priceRange,
  openingHours,
  sameAs = [],
}: LocalBusinessSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    description,
    url,
    ...(image && { image }),
    address: {
      '@type': 'PostalAddress',
      ...address,
    },
    ...(telephone && { telephone }),
    ...(email && { email }),
    ...(priceRange && { priceRange }),
    ...(openingHours && {
      openingHours: openingHours.map((hours: any) => ({
        '@type': 'OpeningHoursSpecification',
        ...hours,
      })),
    }),
    ...(sameAs.length > 0 && { sameAs }),
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [schema]);

  return null;
}

// Website Schema Component
interface WebsiteSchemaProps {
  name: string;
  url: string;
  description: string;
  author: {
    name: string;
    url?: string;
  };
  publisher?: {
    name: string;
    logo: string;
  };
  potentialAction?: {
    target: string;
    queryInput: string;
  };
}

export function WebsiteSchema({
  name,
  url,
  description,
  author,
  publisher,
  potentialAction,
}: WebsiteSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    description,
    author: {
      '@type': 'Person',
      name: author.name,
      ...(author.url && { url: author.url }),
    },
    ...(publisher && {
      publisher: {
        '@type': 'Organization',
        name: publisher.name,
        logo: {
          '@type': 'ImageObject',
          url: publisher.logo,
        },
      },
    }),
    ...(potentialAction && {
      potentialAction: {
        '@type': 'SearchAction',
        ...potentialAction,
      },
    }),
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [schema]);

  return null;
}

// Combined Schema Manager Component
interface SchemaManagerProps {
  schemas: Array<{
    type: 'article' | 'organization' | 'breadcrumb' | 'faq' | 'event' | 'product' | 'localBusiness' | 'website';
    props: any;
  }>;
}

export function SchemaManager({ schemas }: SchemaManagerProps) {
  useEffect(() => {
    // Remove existing schema scripts
    const existingSchemas = document.querySelectorAll('script[type="application/ld+json"]');
    existingSchemas.forEach(script => script.remove());

    // Add new schemas
    schemas.forEach(schema => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema.props);
      document.head.appendChild(script);
    });

    return () => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(script => script.remove());
    };
  }, [schemas]);

  return null;
}