import PageLayout from '../components/PageLayout'
import ContentGrid from '../components/ContentGrid'

const reviewItems = [
  {
    id: 1,
    title: 'Best Hotels in Paris',
    description: 'A curated selection of luxury and boutique hotels in the City of Light.',
    imageUrl: '/images/destinations/paris.jpg',
    href: '/review/paris-hotels',
  },
  {
    id: 2,
    title: 'Tokyo Food Guide',
    description: 'From street food to Michelin stars - the ultimate Tokyo dining experience.',
    imageUrl: '/images/destinations/tokyo.jpg',
    href: '/review/tokyo-food',
  },
  {
    id: 3,
    title: 'New York City Attractions',
    description: 'Must-visit attractions and hidden gems in the Big Apple.',
    imageUrl: '/images/destinations/new-york.jpg',
    href: '/review/nyc-attractions',
  },
  {
    id: 4,
    title: 'Sydney Beach Guide',
    description: 'Discover the best beaches and coastal walks in Sydney.',
    imageUrl: '/images/destinations/sydney.jpg',
    href: '/review/sydney-beaches',
  },
  {
    id: 5,
    title: 'Cape Town Adventures',
    description: 'Top outdoor activities and adventure sports in Cape Town.',
    imageUrl: '/images/destinations/cape-town.jpg',
    href: '/review/capetown-adventures',
  },
  {
    id: 6,
    title: 'Rio Carnival Experience',
    description: 'Everything you need to know about experiencing Rio Carnival.',
    imageUrl: '/images/destinations/rio.jpg',
    href: '/review/rio-carnival',
  },
]

export default function ReviewsPage() {
  return (
    <PageLayout
      title="Travel Reviews"
      description="Honest, detailed reviews of destinations, hotels, and experiences from our expert team."
      heroType="destinations"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ContentGrid items={reviewItems} />
      </div>
    </PageLayout>
  )
} 