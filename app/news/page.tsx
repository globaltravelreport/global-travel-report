import PageLayout from '../components/PageLayout'
import ContentGrid from '../components/ContentGrid'
import { FeaturedItem } from '@/types'

const newsItems: FeaturedItem[] = [
  {
    id: 1,
    title: 'New Travel Restrictions Announced',
    summary: 'Latest updates on international travel requirements and safety measures.',
    image: '/images/news/travel-restrictions.jpg',
    slug: 'travel-restrictions',
    category: 'News',
    date: '2024-02-28',
  },
  {
    id: 2,
    title: 'Airline Industry Recovery',
    summary: 'How airlines are adapting to post-pandemic travel demands.',
    image: '/images/news/airline-recovery.jpg',
    slug: 'airline-recovery',
    category: 'Industry',
    date: '2024-02-27',
  },
  {
    id: 3,
    title: 'Sustainable Travel Trends',
    summary: 'Eco-friendly travel options gaining popularity among tourists.',
    image: '/images/news/sustainable-travel.jpg',
    slug: 'sustainable-travel',
    category: 'Trends',
    date: '2024-02-26',
  },
  {
    id: 4,
    title: 'Digital Nomad Visa Updates',
    summary: 'Countries expanding remote work visa programs to attract global talent.',
    image: '/images/news/digital-nomad.jpg',
    slug: 'digital-nomad',
    category: 'Visas',
    date: '2024-02-25',
  },
  {
    id: 5,
    title: 'Hotel Industry Innovations',
    summary: 'New technologies and services transforming the guest experience.',
    image: '/images/news/hotel-innovations.jpg',
    slug: 'hotel-innovations',
    category: 'Industry',
    date: '2024-02-24',
  },
  {
    id: 6,
    title: 'Travel Insurance Changes',
    summary: 'Important updates to coverage policies and claim procedures.',
    image: '/images/news/travel-insurance.jpg',
    slug: 'travel-insurance',
    category: 'Insurance',
    date: '2024-02-23',
  },
]

export default function NewsPage() {
  return (
    <PageLayout
      title="Travel News"
      description="Stay updated with the latest travel news, industry updates, and destination insights."
      heroType="news"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ContentGrid items={newsItems} />
      </div>
    </PageLayout>
  )
} 