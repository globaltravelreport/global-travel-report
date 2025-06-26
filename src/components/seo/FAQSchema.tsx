'use client';

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { StructuredData } from '@/components/seo/StructuredData';

export interface FAQItem {
  /**
   * The question
   */
  question: string;

  /**
   * The answer to the question
   */
  answer: string;
}

interface FAQSchemaProps {
  /**
   * The list of FAQ items
   */
  items: FAQItem[];

  /**
   * The title of the FAQ section
   */
  title?: string;

  /**
   * The description of the FAQ section
   */
  description?: string;

  /**
   * The CSS class name for the container
   */
  className?: string;

  /**
   * The ID for the FAQ section
   */
  id?: string;
}

/**
 * FAQ Schema Component
 *
 * This component renders a FAQ section with structured data for SEO.
 *
 * @example
 * ```tsx
 * <FAQSchema
 *   title="Frequently Asked Questions"
 *   description="Find answers to common questions about our travel services."
 *   items={[
 *     {
 *       question: "What is the best time to visit Japan?",
 *       answer: "The best time to visit Japan is during spring (March to May) for cherry blossoms and autumn (September to November) for fall foliage."
 *     },
 *     {
 *       question: "Do I need a visa to visit Australia?",
 *       answer: "Most visitors to Australia need a visa or an Electronic Travel Authority (ETA) before traveling."
 *     }
 *   ]}
 * />
 * ```
 */
export function FAQSchema({
  items,
  title = 'Frequently Asked Questions',
  description,
  className = '',
  id = 'faq-section',
}: FAQSchemaProps) {
  // Generate the FAQ schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': items.map(item => ({
      '@type': 'Question',
      'name': item.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': item.answer
      }
    }))
  };

  return (
    <div className={`my-8 ${className}`} id={id}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        {description && <p className="text-gray-600">{description}</p>}
      </div>

      <Accordion className="w-full">
        {items.map((item, index) => (
          <AccordionItem key={index}>
            <AccordionTrigger>
              {item.question}
            </AccordionTrigger>
            <AccordionContent>
              <div dangerouslySetInnerHTML={{ __html: item.answer }} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Add structured data for SEO */}
      <StructuredData data={faqSchema} id="faq-schema" />
    </div>
  );
}

export default FAQSchema;
