import Link from 'next/link'
import Image from 'next/image'

const latestNews = [
  {
    id: 1,
    title: 'New Travel Restrictions Update',
    description: 'Latest updates on international travel requirements and safety measures.',
    imageUrl: '/images/news/travel-restrictions.jpg',
    href: '/article/travel-restrictions',
  },
  {
    id: 2,
    title: 'Sustainable Travel Trends',
    description: 'How eco-friendly travel is shaping the future of tourism.',
    imageUrl: '/images/news/sustainable-travel.jpg',
    href: '/article/sustainable-travel',
  },
  {
    id: 3,
    title: 'Digital Nomad Visas',
    description: 'Countries offering new opportunities for remote workers.',
    imageUrl: '/images/news/digital-nomad.jpg',
    href: '/article/digital-nomad',
  },
]

export default function LatestNews() {
  return (
    <div className="bg-gray-50 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Latest News</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {latestNews.map((item) => (
            <Link key={item.id} href={item.href} className="group">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform duration-200 hover:-translate-y-1">
                <div className="relative h-48">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors duration-200">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-gray-600">
                    {item.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
} 