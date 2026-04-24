import { AFFILIATES, AffiliateMeta } from './affiliateLinks';

interface DealMappingInput {
  title?: string;
  category?: string;
  country?: string;
}

const DEFAULT_DEAL_IDS = ['tripcom', 'ekta', 'wise'];

const keywordDealMap: Array<{ keywords: string[]; dealIds: string[] }> = [
  {
    keywords: ['flight', 'airline', 'airport', 'fare', 'airfare', 'route'],
    dealIds: ['tripcom', 'ekta', 'wise'],
  },
  {
    keywords: ['hotel', 'resort', 'accommodation', 'stay', 'room'],
    dealIds: ['tripcom', 'welcome-pickups', 'wise'],
  },
  {
    keywords: ['cruise', 'ship', 'sailing', 'port'],
    dealIds: ['ekta', 'wise', 'welcome-pickups'],
  },
  {
    keywords: ['insurance', 'medical', 'health', 'safety', 'warning'],
    dealIds: ['ekta', 'wise', 'airalo'],
  },
  {
    keywords: ['sim', 'esim', 'mobile', 'data', 'roaming', 'phone'],
    dealIds: ['airalo', 'yesim', 'wise'],
  },
  {
    keywords: ['car', 'drive', 'road trip', 'rental', 'hire car'],
    dealIds: ['getrentacar', 'kiwitaxi', 'ekta'],
  },
  {
    keywords: ['transfer', 'taxi', 'arrival', 'airport transfer'],
    dealIds: ['welcome-pickups', 'kiwitaxi', 'tripcom'],
  },
  {
    keywords: ['money', 'card', 'bank', 'currency', 'foreign exchange'],
    dealIds: ['wise', 'tripcom', 'ekta'],
  },
];

function normaliseText(input: DealMappingInput): string {
  return [input.title, input.category, input.country]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function getDealsByIds(ids: string[]): AffiliateMeta[] {
  return ids
    .map((id) => AFFILIATES.find((affiliate) => affiliate.id === id))
    .filter((affiliate): affiliate is AffiliateMeta => Boolean(affiliate));
}

export function mapDealsForArticle(input: DealMappingInput): AffiliateMeta[] {
  const text = normaliseText(input);

  const matched = keywordDealMap.find((mapping) =>
    mapping.keywords.some((keyword) => text.includes(keyword))
  );

  const deals = getDealsByIds(matched?.dealIds || DEFAULT_DEAL_IDS);

  return deals.length > 0 ? deals : getDealsByIds(DEFAULT_DEAL_IDS);
}
