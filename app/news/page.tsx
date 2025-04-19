import PageLayout from '../components/PageLayout'
import ContentGrid from '../components/ContentGrid'

const newsItems = [
  {
    id: 1,
    title: 'New Travel Restrictions Announced',
    description: 'Latest updates on international travel requirements and safety measures.',
    imageUrl: '/images/news/travel-restrictions.jpg',
    href: '/article/travel-restrictions',
  },
  {
    id: 2,
    title: 'Airline Industry Recovery',
    description: 'How airlines are adapting to post-pandemic travel demands.',
    imageUrl: '/images/news/airline-recovery.jpg',
    href: '/article/airline-recovery',
  },
  {
    id: 3,
    title: 'Sustainable Travel Trends',
    description: 'Eco-friendly travel options gaining popularity among tourists.',
    imageUrl: '/images/news/sustainable-travel.jpg',
    href: '/article/sustainable-travel',
  },
  {
    id: 4,
    title: 'Digital Nomad Visa Updates',
    description: 'Countries expanding remote work visa programs to attract global talent.',
    imageUrl: '/images/news/digital-nomad.jpg',
    href: '/article/digital-nomad',
  },
  {
    id: 5,
    title: 'Hotel Industry Innovations',
    description: 'New technologies and services transforming the guest experience.',
    imageUrl: '/images/news/hotel-innovations.jpg',
    href: '/article/hotel-innovations',
  },
  {
    id: 6,
    title: 'Travel Insurance Changes',
    description: 'Important updates to coverage policies and claim procedures.',
    imageUrl: '/images/news/travel-insurance.jpg',
    href: '/article/travel-insurance',
  },
]

export default function NewsPage() {
  return (
    <PageLayout
      title="Travel News"
      description="Stay updated with the latest travel news, industry updates, and travel-related developments from around the world."
      heroImage="/images/news-hero.jpg"
    >
      <ContentGrid items={newsItems} />
    </PageLayout>
  )
} 