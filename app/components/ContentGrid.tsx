import { ReactNode } from 'react'
import Image from 'next/image'

interface ContentGridProps {
  items: {
    id: string | number
    title: string
    description: string
    imageUrl: string
    href?: string
  }[]
  children?: ReactNode
}

export default function ContentGrid({ items, children }: ContentGridProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {items.map((item) => (
        <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="relative h-48">
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold text-brand-navy mb-2">{item.title}</h3>
            <p className="text-gray-600 mb-4">{item.description}</p>
            {item.href && (
              <a
                href={item.href}
                className="text-brand-teal hover:text-teal-600 font-medium"
              >
                Learn more →
              </a>
            )}
          </div>
        </div>
      ))}
      {children}
    </div>
  )
} 