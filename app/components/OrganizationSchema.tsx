'use client';

export default function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Global Travel Report",
    "url": "https://globaltravelreport.com/",
    "logo": "https://globaltravelreport.com/images/logo.png",
    "sameAs": [
      "https://twitter.com/globaltravelreport",
      "https://facebook.com/globaltravelreport",
      "https://instagram.com/globaltravelreport"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "editorial@globaltravelreport.com",
      "contactType": "customer service"
    },
    "description": "Global Travel Report is your trusted source for travel insights, destination guides, and inspiring stories from around the world."
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
