import PageLayout from '../components/PageLayout'
import ContentGrid from '../components/ContentGrid'
import { FeaturedItem } from '@/types'

const reviewItems: FeaturedItem[] = [
  {
    id: 1,
    title: 'Best Hotels in Paris',
    summary: 'A comprehensive guide to luxury and boutique hotels in the City of Light.',
    image: '/images/reviews/paris-hotels.jpg',
    slug: 'best-hotels-paris',
    category: 'Hotels',
    date: '2024-02-28',
  },
  {
    id: 2,
    title: 'Top Airlines for Business Class',
    summary: 'Comparing premium services and amenities across major carriers.',
    image: '/images/reviews/business-class.jpg',
    slug: 'top-airlines-business',
    category: 'Airlines',
    date: '2024-02-27',
  },
  {
    id: 3,
    title: 'Luxury Resorts in Maldives',
    summary: 'Exclusive review of the most stunning overwater villas and island retreats.',
    image: '/images/reviews/maldives-resorts.jpg',
    slug: 'maldives-luxury-resorts',
    category: 'Resorts',
    date: '2024-02-26',
  },
  {
    id: 4,
    title: 'Best Travel Credit Cards',
    summary: 'Comparing rewards, benefits, and perks of premium travel cards.',
    image: '/images/reviews/credit-cards.jpg',
    slug: 'travel-credit-cards',
    category: 'Finance',
    date: '2024-02-25',
  },
  {
    id: 5,
    title: 'Safari Lodges in Africa',
    summary: 'Ultimate guide to luxury safari accommodations and wildlife experiences.',
    image: '/images/reviews/safari-lodges.jpg',
    slug: 'african-safari-lodges',
    category: 'Adventure',
    date: '2024-02-24',
  },
  {
    id: 6,
    title: 'First Class Train Journeys',
    summary: 'Exploring the worlds most luxurious rail experiences.',
    image: '/images/reviews/train-journeys.jpg',
    slug: 'luxury-train-journeys',
    category: 'Rail',
    date: '2024-02-23',
  },
]

export default function ReviewsPage() {
  return (
    <PageLayout
      title="Travel Reviews"
      description="In-depth reviews of hotels, airlines, destinations, and travel services."
      heroType="reviews"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ContentGrid items={reviewItems} />
      </div>
    </PageLayout>
  )
} 