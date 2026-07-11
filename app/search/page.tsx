import { Metadata } from 'next';
import SearchPageClient from './SearchPageClient';

// Generate metadata for the search page
export const metadata: Metadata = {
  title: 'Search Stories',
  description: 'Search for travel stories, guides, and insights from around the world.',
  alternates: { canonical: '/search' },
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return <SearchPageClient />;
}
