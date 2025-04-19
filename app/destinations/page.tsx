import PageLayout from '../components/PageLayout'
import { FeaturedItem } from '@/types'

const destinations: FeaturedItem[] = [
  {
    id: 1,
    title: 'Paris, France',
    summary: 'Discover the magic of the City of Light with our comprehensive guide to Paris.',
    image: '/images/destinations/paris.jpg',
    slug: 'paris-france',
    category: 'Destinations',
    date: '2024-04-01',
  },
  {
    id: 2,
    title: 'Tokyo, Japan',
    summary: 'Explore the vibrant culture and modern wonders of Tokyo.',
    image: '/images/destinations/tokyo.jpg',
    slug: 'tokyo-japan',
    category: 'Destinations',
    date: '2024-04-15',
  },
  {
    id: 3,
    title: 'New York City, USA',
    summary: 'Experience the energy and excitement of the Big Apple.',
    image: '/images/destinations/nyc.jpg',
    slug: 'new-york-city',
    category: 'Destinations',
    date: '2024-05-01',
  },
  {
    id: 4,
    title: 'Sydney, Australia',
    summary: 'Discover the natural beauty and urban charm of Sydney.',
    image: '/images/destinations/sydney.jpg',
    slug: 'sydney-australia',
    category: 'Destinations',
    date: '2024-05-15',
  },
  {
    id: 5,
    title: 'Dubai, UAE',
    summary: 'Experience luxury and adventure in the heart of the desert.',
    image: '/images/destinations/dubai.jpg',
    slug: 'dubai-uae',
    category: 'Destinations',
    date: '2024-06-01',
  },
  {
    id: 6,
    title: 'Rio de Janeiro, Brazil',
    summary: 'Explore the vibrant culture and stunning beaches of Rio.',
    image: '/images/destinations/rio.jpg',
    slug: 'rio-de-janeiro',
    category: 'Destinations',
    date: '2024-06-15',
  }
]

export default function DestinationsPage() {
  return (
    <PageLayout
      title="Explore Destinations"
      description="Discover amazing places around the world with detailed guides and insider tips."
      heroType="destinations"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination) => (
            <article
              key={destination.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-48">
                <img
                  src={destination.image}
                  alt={destination.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2">{destination.title}</h2>
                <p className="text-gray-600 mb-4">{destination.summary}</p>
                <a
                  href={`/destinations/${destination.slug}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Read More →
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </PageLayout>
  )
} 