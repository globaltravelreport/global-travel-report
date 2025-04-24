'use client'

import { useState, useEffect } from 'react'

interface ReactionCounts {
  love: number
  inspiring: number
  wantToGo: number
}

interface ReactionsProps {
  slug: string
}

export default function Reactions({ slug }: ReactionsProps) {
  const [counts, setCounts] = useState<ReactionCounts>({
    love: 0,
    inspiring: 0,
    wantToGo: 0
  })
  const [voted, setVoted] = useState<string[]>([])

  useEffect(() => {
    // Load existing reactions from localStorage
    const storedCounts = localStorage.getItem(`reactions-${slug}`)
    const storedVotes = localStorage.getItem(`reactions-votes-${slug}`)
    
    if (storedCounts) {
      setCounts(JSON.parse(storedCounts))
    }
    if (storedVotes) {
      setVoted(JSON.parse(storedVotes))
    }
  }, [slug])

  const handleReaction = (type: keyof ReactionCounts) => {
    if (voted.includes(type)) return

    const newCounts = {
      ...counts,
      [type]: counts[type] + 1
    }
    const newVoted = [...voted, type]

    // Update state
    setCounts(newCounts)
    setVoted(newVoted)

    // Save to localStorage
    localStorage.setItem(`reactions-${slug}`, JSON.stringify(newCounts))
    localStorage.setItem(`reactions-votes-${slug}`, JSON.stringify(newVoted))
  }

  const reactions = [
    { type: 'love' as const, emoji: '❤️', label: 'Love it' },
    { type: 'inspiring' as const, emoji: '🔥', label: 'Inspiring' },
    { type: 'wantToGo' as const, emoji: '🌍', label: 'Want to go' }
  ]

  return (
    <div className="flex flex-wrap gap-4 justify-center my-6">
      {reactions.map(({ type, emoji, label }) => (
        <button
          key={type}
          onClick={() => handleReaction(type)}
          disabled={voted.includes(type)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full
            ${
              voted.includes(type)
                ? 'bg-gray-100 cursor-not-allowed'
                : 'bg-white hover:bg-gray-50 active:bg-gray-100'
            }
            border border-gray-200 transition-colors
            ${voted.includes(type) ? 'opacity-75' : ''}
          `}
          aria-label={`React with ${label}`}
        >
          <span className="text-xl">{emoji}</span>
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-medium text-gray-500 ml-1">
            {counts[type]}
          </span>
        </button>
      ))}
    </div>
  )
} 