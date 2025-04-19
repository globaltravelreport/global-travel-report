import PageLayout from '../components/PageLayout'
import ContentGrid from '../components/ContentGrid'
import { FeaturedItem } from '@/types'

const tipItems: FeaturedItem[] = [
  {
    id: 1,
    title: 'Packing Tips for Long Trips',
    summary: 'Essential tips for efficient packing and organizing your luggage.',
    image: '/images/tips/packing.jpg',
    slug: 'packing-tips-long-trips',
    category: 'Packing',
    date: '2024-02-28',
  },
  {
    id: 2,
    title: 'Budget Travel Hacks',
    summary: 'Smart ways to save money while traveling without compromising on experience.',
    image: '/images/tips/budget-travel.jpg',
    slug: 'budget-travel-hacks',
    category: 'Budget',
    date: '2024-02-27',
  },
  {
    id: 3,
    title: 'Solo Travel Safety',
    summary: 'Essential safety tips and advice for solo travelers around the world.',
    image: '/images/tips/solo-travel.jpg',
    slug: 'solo-travel-safety',
    category: 'Safety',
    date: '2024-02-26',
  },
  {
    id: 4,
    title: 'Travel Photography Guide',
    summary: 'Tips for capturing stunning travel photos with any camera.',
    image: '/images/tips/photography.jpg',
    slug: 'travel-photography-guide',
    category: 'Photography',
    date: '2024-02-25',
  },
  {
    id: 5,
    title: 'Jet Lag Prevention',
    summary: 'Proven strategies to minimize jet lag and maximize your travel time.',
    image: '/images/tips/jet-lag.jpg',
    slug: 'jet-lag-prevention',
    category: 'Health',
    date: '2024-02-24',
  },
  {
    id: 6,
    title: 'Local Culture Navigation',
    summary: 'How to respectfully navigate and embrace different cultures while traveling.',
    image: '/images/tips/culture.jpg',
    slug: 'local-culture-navigation',
    category: 'Culture',
    date: '2024-02-23',
  },
]

export default function TipsPage() {
  return (
    <PageLayout
      title="Travel Tips"
      description="Expert advice and practical tips to make your travels smoother and more enjoyable."
      heroType="tips"
    >
      <ContentGrid items={tipItems} />
    </PageLayout>
  )
} 