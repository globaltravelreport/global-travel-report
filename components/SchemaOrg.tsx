import { Story } from '@/types/Story';
import { generateAllSchemas } from '@/src/lib/schema';
import Script from 'next/script';

interface SchemaOrgProps {
  story: Story;
  siteUrl?: string;
}

/**
 * Component to add schema.org structured data to a page
 * @param props - Component props
 * @returns Script component with JSON-LD data
 */
export default function SchemaOrg({ story, siteUrl = 'https://www.globaltravelreport.com' }: SchemaOrgProps) {
  // Generate all applicable schemas for the story
  const schemas = generateAllSchemas(story, siteUrl);
  
  return (
    <>
      {schemas.map((schema, index) => (
        <Script
          key={`schema-${index}`}
          id={`schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
