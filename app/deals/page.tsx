import PageLayout from '../components/PageLayout'
import ContentGrid from '../components/ContentGrid'

const dealItems = [
  {
    id: 1,
    title: 'Summer Vacation Package',
    description: 'All-inclusive resort stay with flights included. Limited time offer!',
    imageUrl: '/images/deals/summer-vacation.jpg',
    href: '/deal/summer-vacation',
  },
  {
    id: 2,
    title: 'Business Class Upgrade',
    description: 'Special rates on business class upgrades for select routes.',
    imageUrl: '/images/deals/business-class.jpg',
    href: '/deal/business-class',
  },
  {
    id: 3,
    title: 'Hotel Loyalty Program',
    description: 'Join our loyalty program and get exclusive member rates and benefits.',
    imageUrl: '/images/deals/hotel-loyalty.jpg',
    href: '/deal/hotel-loyalty',
  },
  {
    id: 4,
    title: 'Family Travel Package',
    description: 'Special rates for family vacations with kids stay free.',
    imageUrl: '/images/deals/family-package.jpg',
    href: '/deal/family-package',
  },
  {
    id: 5,
    title: 'Last Minute Getaways',
    description: 'Amazing deals on last-minute travel bookings.',
    imageUrl: '/images/deals/last-minute.jpg',
    href: '/deal/last-minute',
  },
  {
    id: 6,
    title: 'Group Travel Discounts',
    description: 'Special rates for group bookings of 10 or more people.',
    imageUrl: '/images/deals/group-travel.jpg',
    href: '/deal/group-travel',
  },
]

export default function DealsPage() {
  return (
    <PageLayout
      title="Travel Deals"
      description="Find the best travel deals, discounts, and special offers for your next adventure."
      heroImage="/images/deals-hero.jpg"
    >
      <ContentGrid items={dealItems} />
    </PageLayout>
  )
} 