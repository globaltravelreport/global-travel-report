import { TagIcon, FireIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'

const deals = [
  {
    id: 1,
    title: 'Premium Travel Card',
    description: 'Earn 5x points on travel purchases',
    badge: 'Best Deal',
    icon: FireIcon,
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 2,
    title: 'Travel Rewards Plus',
    description: 'No foreign transaction fees',
    badge: 'Staff Pick',
    icon: TagIcon,
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  },
]

const Deals = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-brand-navy mb-8">Featured Deals</h2>
        <div className="space-y-6">
          {deals.map((deal) => {
            const Icon = deal.icon
            return (
              <div
                key={deal.id}
                className="bg-white rounded-xl shadow-lg p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-teal text-white">
                      {deal.badge}
                    </span>
                    <Icon className="h-6 w-6 text-brand-teal" />
                  </div>
                  <h3 className="mt-3 text-xl font-bold text-brand-navy">{deal.title}</h3>
                  <p className="mt-2 text-gray-600">{deal.description}</p>
                </div>
                <div className="mt-4 md:mt-0 md:ml-8 relative h-32 w-32">
                  <Image
                    src={deal.imageUrl}
                    alt={deal.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div className="mt-4 md:mt-0 md:ml-8">
                  <button className="w-full md:w-auto bg-brand-navy hover:bg-opacity-90 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-200">
                    Learn More
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Deals 