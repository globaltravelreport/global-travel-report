export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function isWithinLast7Days(dateString: string): boolean {
  const date = new Date(dateString)
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  return date >= sevenDaysAgo && date <= now
}

export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}