import PageLayout from '../components/PageLayout'
import ContentGrid from '../components/ContentGrid'
import { FeaturedItem } from '@/types'

const dealItems: FeaturedItem[] = [
  {
    id: 1,
    title: 'Bali Beach Resort Package',
    summary: 'Enjoy 7 nights at a luxury beach resort in Bali with all-inclusive meals and spa treatments.',
    image: '/images/deals/bali-resort.jpg',
    slug: 'bali-beach-resort-package',
    category: 'Deals',
    date: '2024-04-01',
  },
  {
    id: 2,
    title: 'European City Break',
    summary: 'Explore Paris, Rome, and Barcelona with this 10-day guided tour package including flights and hotels.',
    image: '/images/deals/europe-tour.jpg',
    slug: 'european-city-break',
    category: 'Deals',
    date: '2024-04-15',
  },
  {
    id: 3,
    title: 'Safari Adventure',
    summary: 'Experience a 5-day safari in Kenya with luxury accommodation and expert guides.',
    image: '/images/deals/safari.jpg',
    slug: 'safari-adventure',
    category: 'Deals',
    date: '2024-05-01',
  },
  {
    id: 4,
    title: 'Caribbean Cruise',
    summary: '7-day Caribbean cruise visiting multiple islands with all-inclusive dining and entertainment.',
    image: '/images/deals/caribbean-cruise.jpg',
    slug: 'caribbean-cruise',
    category: 'Deals',
    date: '2024-05-15',
  }
]

export default function DealsPage() {
  return (
    <PageLayout
      title="Travel Deals"
      description="Find the best travel deals, discounts, and special offers for your next adventure."
      heroType="deals"
    >
      <ContentGrid items={dealItems} />
    </PageLayout>
  )
} 