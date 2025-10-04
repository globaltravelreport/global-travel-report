'use client';

export default function WebsiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Global Travel Report",
    "url": "https://globaltravelreport.com/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://globaltravelreport.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "description": "Your trusted source for global travel insights, destination guides, and inspiring stories from around the world.",
    "publisher": {
      "@type": "Organization",
      "name": "Global Travel Report",
      "logo": {
        "@type": "ImageObject",
        "url": "https://globaltravelreport.com/images/logo.png"
      }
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
