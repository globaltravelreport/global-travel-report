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
 * Emit crawler-visible JSON-LD as a real application/ld+json script.
 * Avoid next/script — it often leaves schema only in the RSC flight payload.
 * Escape "<" so the JSON cannot break out of the script tag.
 */
export function StructuredData({ data, id = 'structured-data' }: StructuredDataProps) {
  const jsonLd = JSON.stringify(data).replace(/</g, '\\u003c');

  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}
