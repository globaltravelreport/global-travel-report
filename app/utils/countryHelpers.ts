import { Country } from '../types/story'

// Map of country names to their corresponding flag emojis
const countryFlags: Record<string, string> = {
  'United States': '🇺🇸',
  'United Kingdom': '🇬🇧',
  'France': '🇫🇷',
  'Germany': '🇩🇪',
  'Italy': '🇮🇹',
  'Spain': '🇪🇸',
  'Portugal': '🇵🇹',
  'Greece': '🇬🇷',
  'Japan': '🇯🇵',
  'China': '🇨🇳',
  'Australia': '🇦🇺',
  'New Zealand': '🇳🇿',
  'Canada': '🇨🇦',
  'Mexico': '🇲🇽',
  'Brazil': '🇧🇷',
  'Argentina': '🇦🇷',
  'Thailand': '🇹🇭',
  'Vietnam': '🇻🇳',
  'Singapore': '🇸🇬',
  'United Arab Emirates': '🇦🇪',
  // Add more countries as needed
}

export function getFlagEmoji(countryName: string): string {
  const cleanedName = countryName.trim()
  return countryFlags[cleanedName] || '🌍' // Default to globe emoji if country not found
}

export function getCountrySlug(countryName: string): string {
  return countryName.toLowerCase().replace(/\s+/g, '-')
}

export function getCountryTitle(countryName: string): string {
  return `${getFlagEmoji(countryName)} ${countryName} Travel Stories & Guides`
}

export function getCountryMetaDescription(countryName: string): string {
  return `Discover the latest travel stories, guides, and experiences from ${countryName}. Find insider tips, destination highlights, and travel inspiration.`
} 