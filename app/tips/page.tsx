import PageLayout from '../components/PageLayout'
import ContentGrid from '../components/ContentGrid'

const tipItems = [
  {
    id: 1,
    title: 'Packing Like a Pro',
    description: 'Essential packing tips and checklists for different types of travel.',
    imageUrl: '/images/tips/packing.jpg',
    href: '/tip/packing',
  },
  {
    id: 2,
    title: 'Budget Travel Hacks',
    description: 'Smart ways to save money while traveling without sacrificing comfort.',
    imageUrl: '/images/tips/budget.jpg',
    href: '/tip/budget',
  },
  {
    id: 3,
    title: 'Airport Security Guide',
    description: 'Navigate airport security smoothly with these expert tips.',
    imageUrl: '/images/tips/security.jpg',
    href: '/tip/security',
  },
  {
    id: 4,
    title: 'Travel Photography Tips',
    description: 'Capture amazing travel memories with these photography techniques.',
    imageUrl: '/images/tips/photography.jpg',
    href: '/tip/photography',
  },
  {
    id: 5,
    title: 'Staying Healthy While Traveling',
    description: 'Tips for maintaining your health and wellness on the road.',
    imageUrl: '/images/tips/health.jpg',
    href: '/tip/health',
  },
  {
    id: 6,
    title: 'Traveling with Kids',
    description: 'Make family travel enjoyable with these practical tips.',
    imageUrl: '/images/tips/family.jpg',
    href: '/tip/family',
  },
]

export default function TipsPage() {
  return (
    <PageLayout
      title="Travel Tips"
      description="Expert advice and practical tips to make your travels smoother and more enjoyable."
      heroImage="/images/tips-hero.jpg"
    >
      <ContentGrid items={tipItems} />
    </PageLayout>
  )
} 