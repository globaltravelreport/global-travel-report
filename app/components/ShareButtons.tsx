'use client'

import { useEffect, useState } from 'react'
import { FaTwitter, FaFacebook, FaLinkedin, FaLink } from 'react-icons/fa'

interface ShareButtonsProps {
  title: string
  url: string
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [copied])

  if (!isMounted) return null

  const encodedTitle = encodeURIComponent(title)
  const encodedUrl = encodeURIComponent(url)

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="flex flex-col items-start gap-4 mt-8">
      <h3 className="text-lg font-semibold">Share this story</h3>
      <div className="flex items-center gap-4">
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-gray-600 hover:text-blue-500 transition-colors"
          aria-label="Share on Twitter"
        >
          <FaTwitter className="w-5 h-5" />
        </a>
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
          aria-label="Share on Facebook"
        >
          <FaFacebook className="w-5 h-5" />
        </a>
        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-gray-600 hover:text-blue-700 transition-colors"
          aria-label="Share on LinkedIn"
        >
          <FaLinkedin className="w-5 h-5" />
        </a>
        <button
          onClick={copyToClipboard}
          className="p-2 text-gray-600 hover:text-gray-900 transition-colors relative"
          aria-label="Copy link to clipboard"
        >
          <FaLink className="w-5 h-5" />
          {copied && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm py-1 px-2 rounded animate-fade-in whitespace-nowrap">
              Link copied!
            </span>
          )}
        </button>
      </div>
    </div>
  )
} 