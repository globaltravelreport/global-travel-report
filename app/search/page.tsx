import { Metadata } from 'next';
import SearchPageClient from './SearchPageClient';

// Generate metadata for the search page
export const metadata: Metadata = {
  title: 'Search Stories | Global Travel Report',
  description: 'Search for travel stories, guides, and insights from around the world.',
};

export default function SearchPage() {
  return <SearchPageClient />;
}
