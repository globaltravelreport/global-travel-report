import React from 'react';
import Script from 'next/script';
import DOMPurify from 'isomorphic-dompurify';

interface StructuredDataProps {
  /**
   * Structured data to render
   */
  data: Record<string, any> | Record<string, any>[];

  /**
   * ID for the script tag
   */
  id?: string;
}

/**
 * Component for adding structured data (JSON-LD) to a page
 */
export function StructuredData({ data, id = 'structured-data' }: StructuredDataProps) {
  // Convert data to string and sanitize
  const jsonLd = JSON.stringify(data);
  const sanitizedJsonLd = DOMPurify.sanitize(jsonLd);

  return (
    <Script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: sanitizedJsonLd }}
    />
  );
}
