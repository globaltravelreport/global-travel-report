'use client'

import { ReactNode } from 'react'
import Image from 'next/image'

interface ContentCardProps {
  title: string
  description: string
  imageUrl?: string
  children?: ReactNode
}

export default function ContentCard({ title, description, imageUrl, children }: ContentCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="relative h-48 bg-gray-200">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-brand-navy mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        {children}
      </div>
    </div>
  )
} 