import PageLayout from '../components/PageLayout'
import ContentGrid from '../components/ContentGrid'

const destinationItems = [
  {
    id: 1,
    title: 'Paris, France',
    description: 'Discover the City of Light with its iconic landmarks, world-class museums, and charming cafés.',
    imageUrl: '/images/destinations/paris.jpg',
    href: '/destination/paris',
  },
  {
    id: 2,
    title: 'Tokyo, Japan',
    description: 'Experience the perfect blend of traditional culture and cutting-edge technology.',
    imageUrl: '/images/destinations/tokyo.jpg',
    href: '/destination/tokyo',
  },
  {
    id: 3,
    title: 'New York City, USA',
    description: 'The city that never sleeps offers endless entertainment, dining, and cultural experiences.',
    imageUrl: '/images/destinations/new-york.jpg',
    href: '/destination/new-york',
  },
  {
    id: 4,
    title: 'Sydney, Australia',
    description: 'Explore the iconic Opera House, beautiful beaches, and vibrant city life.',
    imageUrl: '/images/destinations/sydney.jpg',
    href: '/destination/sydney',
  },
  {
    id: 5,
    title: 'Cape Town, South Africa',
    description: 'Stunning landscapes, rich history, and diverse cultural experiences await.',
    imageUrl: '/images/destinations/cape-town.jpg',
    href: '/destination/cape-town',
  },
  {
    id: 6,
    title: 'Rio de Janeiro, Brazil',
    description: 'Vibrant culture, beautiful beaches, and the iconic Christ the Redeemer statue.',
    imageUrl: '/images/destinations/rio.jpg',
    href: '/destination/rio',
  },
]

export default function DestinationsPage() {
  return (
    <PageLayout
      title="Travel Destinations"
      description="Explore our curated collection of must-visit destinations around the world."
      heroImage="/images/destinations-hero.jpg"
    >
      <ContentGrid items={destinationItems} />
    </PageLayout>
  )
} 