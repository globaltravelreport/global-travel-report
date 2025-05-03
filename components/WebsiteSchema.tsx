import Script from 'next/script';

/**
 * Component to add website schema.org structured data to the homepage
 * @returns Script component with JSON-LD data
 */
export default function WebsiteSchema() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.globaltravelreport.com';
  
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Global Travel Report',
    'url': siteUrl,
    'description': 'Latest travel news, insights, and destination guides from around the world.',
    'publisher': {
      '@type': 'Organization',
      'name': 'Global Travel Report',
      'logo': {
        '@type': 'ImageObject',
        'url': `${siteUrl}/images/logo.png`,
        'width': '192',
        'height': '192'
      }
    },
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `${siteUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    'sameAs': [
      'https://www.facebook.com/globaltravelreport',
      'https://twitter.com/globaltravelreport',
      'https://www.linkedin.com/company/globaltravelreport',
      'https://www.youtube.com/c/globaltravelreport',
      'https://www.tiktok.com/@globaltravelreport',
      'https://medium.com/@globaltravelreport'
    ]
  };
  
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'Global Travel Report',
    'url': siteUrl,
    'logo': `${siteUrl}/images/logo.png`,
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': '',
      'contactType': 'customer service',
      'email': 'editorial@globaltravelreport.com',
      'areaServed': 'Worldwide',
      'availableLanguage': 'English'
    },
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': 'Sydney',
      'addressRegion': 'NSW',
      'addressCountry': 'Australia'
    },
    'sameAs': [
      'https://www.facebook.com/globaltravelreport',
      'https://twitter.com/globaltravelreport',
      'https://www.linkedin.com/company/globaltravelreport',
      'https://www.youtube.com/c/globaltravelreport',
      'https://www.tiktok.com/@globaltravelreport',
      'https://medium.com/@globaltravelreport'
    ]
  };
  
  return (
    <>
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
    </>
  );
}
