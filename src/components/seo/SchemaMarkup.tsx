'use client';

import { useEffect } from 'react';

interface BaseSchema {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

interface OrganizationSchema extends BaseSchema {
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  description?: string;
  sameAs?: string[];
  contactPoint?: {
    '@type': 'ContactPoint';
    contactType: string;
    email?: string;
    telephone?: string;
  };
}

interface ArticleSchema extends BaseSchema {
  '@type': 'Article';
  headline: string;
  description: string;
  image: string | string[];
  datePublished: string;
  dateModified?: string;
  author: {
    '@type': 'Person' | 'Organization';
    name: string;
    url?: string;
  };
  publisher: {
    '@type': 'Organization';
    name: string;
    logo: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  mainEntityOfPage: {
    '@type': 'WebPage';
    '@id': string;
  };
  articleSection?: string;
  keywords?: string;
  wordCount?: number;
  timeRequired?: string;
  speakable?: {
    '@type': 'SpeakableSpecification';
    cssSelector: string[];
  };
}

interface BreadcrumbSchema extends BaseSchema {
  '@type': 'BreadcrumbList';
  itemListElement: {
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }[];
}

interface FAQSchema extends BaseSchema {
  '@type': 'FAQPage';
  mainEntity: {
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }[];
}

interface EventSchema extends BaseSchema {
  '@type': 'Event';
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: {
    '@type': 'Place';
    name: string;
    address: {
      '@type': 'PostalAddress';
      streetAddress?: string;
      addressLocality: string;
      addressRegion?: string;
      postalCode?: string;
      addressCountry: string;
    };
  };
  image?: string | string[];
  offers?: {
    '@type': 'Offer';
    price: string;
    priceCurrency: string;
    availability: string;
    validFrom?: string;
  };
}

interface ProductSchema extends BaseSchema {
  '@type': 'Product';
  name: string;
  description: string;
  image: string | string[];
  offers: {
    '@type': 'Offer';
    price: string;
    priceCurrency: string;
    availability: string;
    validFrom?: string;
    seller: {
      '@type': 'Organization';
      name: string;
    };
  };
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
  };
  brand?: {
    '@type': 'Brand';
    name: string;
  };
}

interface LocalBusinessSchema extends BaseSchema {
  '@type': 'LocalBusiness' | 'TravelAgency';
  name: string;
  description: string;
  url: string;
  telephone?: string;
  email?: string;
  address: {
    '@type': 'PostalAddress';
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: {
    '@type': 'GeoCoordinates';
    latitude: number;
    longitude: number;
  };
  openingHoursSpecification?: {
    '@type': 'OpeningHoursSpecification';
    dayOfWeek: string[];
    opens: string;
    closes: string;
  }[];
  priceRange?: string;
  image?: string | string[];
}

interface WebsiteSchema extends BaseSchema {
  '@type': 'WebSite';
  name: string;
  url: string;
  description?: string;
  potentialAction?: {
    '@type': 'SearchAction';
    target: string;
    'query-input': string;
  };
}

interface SchemaMarkupProps {
  schemas: BaseSchema[];
  className?: string;
}

export function SchemaMarkup({ schemas, className = '' }: SchemaMarkupProps) {
  useEffect(() => {
    // Remove existing schema markup
    const existingSchemas = document.querySelectorAll('script[type="application/ld+json"]');
    existingSchemas.forEach(script => {
      if (script.getAttribute('data-schema-source') === 'react-component') {
        script.remove();
      }
    });

    // Add new schema markup
    schemas.forEach((schema, index) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-schema-source', 'react-component');
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    // Cleanup function
    return () => {
      const scripts = document.querySelectorAll('script[data-schema-source="react-component"]');
      scripts.forEach(script => script.remove());
    };
  }, [schemas]);

  return (
    <div className={className}>
      {/* This component doesn't render anything visible, just manages schema markup */}
    </div>
  );
}

// Pre-configured schema generators
export const SchemaGenerators = {
  organization: (data: {
    name: string;
    url: string;
    logo: string;
    description?: string;
    sameAs?: string[];
    contactPoint?: OrganizationSchema['contactPoint'];
  }): OrganizationSchema => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    ...data,
  }),

  article: (data: {
    headline: string;
    description: string;
    image: string | string[];
    datePublished: string;
    dateModified?: string;
    author: ArticleSchema['author'];
    publisher: ArticleSchema['publisher'];
    mainEntityOfPage: ArticleSchema['mainEntityOfPage'];
    articleSection?: string;
    keywords?: string;
    wordCount?: number;
    timeRequired?: string;
  }): ArticleSchema => ({
    '@context': 'https://schema.org',
    '@type': 'Article',
    ...data,
  }),

  breadcrumbs: (items: { name: string; item: string }[]): BreadcrumbSchema => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  }),

  faq: (questions: { question: string; answer: string }[]): FAQSchema => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(q => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  }),

  event: (data: {
    name: string;
    description: string;
    startDate: string;
    endDate?: string;
    location: EventSchema['location'];
    image?: string | string[];
    offers?: EventSchema['offers'];
  }): EventSchema => ({
    '@context': 'https://schema.org',
    '@type': 'Event',
    ...data,
  }),

  product: (data: {
    name: string;
    description: string;
    image: string | string[];
    offers: ProductSchema['offers'];
    aggregateRating?: ProductSchema['aggregateRating'];
    brand?: ProductSchema['brand'];
  }): ProductSchema => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    ...data,
  }),

  localBusiness: (data: {
    name: string;
    description: string;
    url: string;
    telephone?: string;
    email?: string;
    address: LocalBusinessSchema['address'];
    geo?: LocalBusinessSchema['geo'];
    openingHoursSpecification?: LocalBusinessSchema['openingHoursSpecification'];
    priceRange?: string;
    image?: string | string[];
  }): LocalBusinessSchema => ({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    ...data,
  }),

  website: (data: {
    name: string;
    url: string;
    description?: string;
    potentialAction?: WebsiteSchema['potentialAction'];
  }): WebsiteSchema => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    ...data,
  }),
};

// Travel-specific schema generators
export const TravelSchemas = {
  travelAgency: (data: {
    name: string;
    description: string;
    url: string;
    telephone?: string;
    email?: string;
    address: LocalBusinessSchema['address'];
    priceRange?: string;
  }): LocalBusinessSchema => ({
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    ...data,
  }),

  destination: (data: {
    name: string;
    description: string;
    image: string | string[];
    address: {
      addressLocality: string;
      addressRegion?: string;
      addressCountry: string;
    };
    geo?: {
      latitude: number;
      longitude: number;
    };
  }): BaseSchema => ({
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: data.name,
    description: data.description,
    image: data.image,
    address: {
      '@type': 'PostalAddress',
      ...data.address,
    },
    ...(data.geo && { geo: { '@type': 'GeoCoordinates', ...data.geo } }),
  }),

  travelArticle: (data: {
    headline: string;
    description: string;
    image: string | string[];
    datePublished: string;
    author: ArticleSchema['author'];
    publisher: ArticleSchema['publisher'];
    mainEntityOfPage: ArticleSchema['mainEntityOfPage'];
    destinations?: string[];
    travelType?: string;
  }): ArticleSchema => ({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.headline,
    description: data.description,
    image: data.image,
    datePublished: data.datePublished,
    author: data.author,
    publisher: data.publisher,
    mainEntityOfPage: data.mainEntityOfPage,
    articleSection: 'Travel',
    keywords: data.destinations?.join(', '),
    ...(data.travelType && { articleSection: `Travel/${data.travelType}` }),
  }),

  travelFAQ: (questions: { question: string; answer: string }[]): FAQSchema => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(q => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  }),
};