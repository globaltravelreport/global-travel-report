/**
 * FAQ Schema Component
 *
 * Generates FAQ structured data (JSON-LD) for better SEO
 * and rich snippets in search results.
 */

import React from 'react';
import Head from 'next/head';

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

interface FAQSchemaProps {
  faqs: FAQItem[];
  pageTitle?: string;
  className?: string;
}

export function FAQSchema({ faqs, pageTitle, className = '' }: FAQSchemaProps) {
  // Generate JSON-LD structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    })),
    ...(pageTitle && { 'name': pageTitle })
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData, null, 0)
          }}
        />
      </Head>

      {/* FAQ Display */}
      <div className={`faq-schema ${className}`}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItemComponent key={index} faq={faq} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

interface FAQItemComponentProps {
  faq: FAQItem;
}

function FAQItemComponent({ faq }: FAQItemComponentProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-medium text-gray-900 pr-4">
          {faq.question}
        </span>
        <svg
          className={`w-5 h-5 text-gray-500 transform transition-transform flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="px-6 pb-4">
          <div className="text-gray-700 leading-relaxed">
            {faq.answer}
          </div>
          {faq.category && (
            <div className="mt-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {faq.category}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Common FAQ data for travel-related questions
 */
export const commonTravelFAQs: FAQItem[] = [
  {
    question: 'What are the best times to book travel deals?',
    answer: 'The best times to book travel deals vary by destination and type of travel. Generally, booking 2-3 months in advance for flights and 3-6 months for hotels often yields the best prices. For cruises, booking 6-12 months ahead can secure the best rates and cabin selections.',
    category: 'Booking Tips'
  },
  {
    question: 'How can I find the cheapest flights?',
    answer: 'To find the cheapest flights, use flexible date searches, set up price alerts, book mid-week (Tuesday/Wednesday), consider nearby airports, and use incognito mode to avoid dynamic pricing. Also, consider budget airlines and be flexible with your travel dates.',
    category: 'Flights'
  },
  {
    question: 'What should I pack for a cruise vacation?',
    answer: 'For a cruise vacation, pack lightweight clothing, formal wear for dinner nights, comfortable walking shoes, swimwear, sunscreen, medications, travel documents, and don\'t forget your passport! Check your cruise line\'s specific dress code and packing guidelines.',
    category: 'Cruises'
  },
  {
    question: 'How do I stay safe while traveling abroad?',
    answer: 'Stay safe abroad by researching your destination, keeping valuables secure, using reputable transportation, staying aware of your surroundings, keeping emergency contacts handy, and considering travel insurance. Also, register with your embassy and share your itinerary with family.',
    category: 'Safety'
  },
  {
    question: 'What travel insurance do I need?',
    answer: 'Essential travel insurance should cover trip cancellation, medical emergencies, lost luggage, and flight delays. Consider your destination, activities planned, and any pre-existing conditions. Look for policies that include COVID-19 coverage and adventure sports if applicable.',
    category: 'Insurance'
  },
  {
    question: 'How can I travel more sustainably?',
    answer: 'Travel sustainably by choosing eco-friendly accommodations, using public transportation, supporting local businesses, minimizing plastic use, offsetting your carbon footprint, and respecting local cultures and wildlife. Consider slow travel and destinations with strong environmental practices.',
    category: 'Sustainability'
  }
];

export default FAQSchema;
