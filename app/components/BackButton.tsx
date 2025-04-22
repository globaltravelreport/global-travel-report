'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface BackButtonProps {
  href?: string
  label?: string
}

export default function BackButton({ href, label = 'Back' }: BackButtonProps) {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    if (!href) {
      e.preventDefault()
      router.back()
    }
  }

  return (
    <Link
      href={href || '#'}
      onClick={handleClick}
      className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
    >
      <svg
        className="mr-2 h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      {label}
    </Link>
  )
} 