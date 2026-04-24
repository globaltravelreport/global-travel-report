'use client';

import { trackClick } from '@/lib/trackClick';
import { mapDealsForArticle } from '@/lib/dealMapping';
import { AffiliateMeta } from '@/lib/affiliateLinks';

interface Props {
  title?: string;
  category?: string;
  country?: string;
}

export default function RecommendedDeals({ title, category, country }: Props) {
  const deals: AffiliateMeta[] = mapDealsForArticle({ title, category, country });

  return (
    <div className="mt-10">
      <h3 className="text-lg font-semibold mb-4">Recommended Travel Deals</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {deals.map((deal) => (
          <div
            key={deal.id}
            className="border rounded-lg p-4 bg-white hover:shadow-sm transition"
          >
            <div className="text-xl mb-2">{deal.iconEmoji}</div>

            <h4 className="font-medium text-gray-900 mb-1">
              {deal.name}
            </h4>

            <p className="text-sm text-gray-600 mb-3">
              {deal.short}
            </p>

            <a
              href={deal.href}
              target="_blank"
              rel="sponsored noopener"
              onClick={() => trackClick(deal.id, 'recommended-deals')}
              className="inline-block text-sm font-medium text-blue-600 hover:underline"
            >
              View deal →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
